import type { TaonServerMiddlewareInterceptOptions } from 'ng2-rest/src';

export namespace TaonSessionUtils {
  export const getRequestMetadata = (
    req: TaonServerMiddlewareInterceptOptions['req'],
  ): { userAgent?: string; ip?: string; deviceName?: string } => {
    //#region @websqlFunc
    const header = req.headers?.['user-agent'];
    const userAgent =
      typeof header === 'string' ? header.slice(0, 4096) : undefined;

    // Express applies trust-proxy; the Worker adapter resolves the edge IP.
    const ip = req.ip || req.socket?.remoteAddress;

    const browsers = [
      ['Edg/', 'Edge'],
      ['OPR/', 'Opera'],
      ['Chrome/', 'Chrome'],
      ['Firefox/', 'Firefox'],
      ['Safari/', 'Safari'],
    ];

    const systems = [
      ['Android', 'Android'],
      ['iPhone|iPad', 'iOS'],
      ['Windows', 'Windows'],
      ['Macintosh', 'macOS'],
      ['Linux', 'Linux'],
    ];

    const browser = browsers.find(([pattern]) =>
      userAgent?.includes(pattern),
    )?.[1];

    const system = systems.find(([pattern]) =>
      new RegExp(pattern).test(userAgent || ''),
    )?.[1];

    return {
      userAgent,
      ip,
      deviceName: [browser, system].filter(Boolean).join(' / ') || undefined,
    };
    //#endregion
  };

  type GoogleAuthStage =
    | 'configuration'
    | 'token_exchange'
    | 'token_response'
    | 'id_token_header'
    | 'signing_keys'
    | 'id_token_signature'
    | 'id_token_claims'
    | 'identity_claims';

  export class GoogleAuthError extends Error {
    constructor(
      readonly stage: GoogleAuthStage,
      readonly reason: string,
      readonly httpStatus?: number,
    ) {
      super(`${stage}: ${reason}`);
      this.name = 'GoogleAuthError';
    }
  }

  interface GoogleTokenResponse {
    id_token?: unknown;
    error?: unknown;
  }

  interface GoogleIdTokenPayload {
    iss: string;
    aud: string | string[];
    sub: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
    exp: number;
    iat: number;
  }

  interface GoogleJwk extends JsonWebKey {
    kid?: string;
  }

  const knownTokenExchangeErrors = new Set([
    'invalid_grant',
    'invalid_client',
    'invalid_request',
    'redirect_uri_mismatch',
    'unauthorized_client',
    'unsupported_grant_type',
    'temporarily_unavailable',
  ]);

  async function runGoogleAuthStep<T>(
    stage: GoogleAuthStage,
    reason: string,
    run: () => T | Promise<T>,
  ): Promise<T> {
    try {
      return await run();
    } catch {
      throw new GoogleAuthError(stage, reason);
    }
  }

  //#region verify google authorization code
  export async function verifyGoogleAuthorizationCode(
    clientId: string | undefined,
    clientSecret: string | undefined,
    code: string | undefined,
  ) {
    //#region @websqlFunc
    if (!clientId) {
      throw new GoogleAuthError('configuration', 'missing_client_id');
    }

    if (!clientSecret) {
      throw new GoogleAuthError('configuration', 'missing_client_secret');
    }

    if (typeof code !== 'string' || !code.trim()) {
      throw new GoogleAuthError('token_exchange', 'missing_authorization_code');
    }

    const tokenResponse = await runGoogleAuthStep(
      'token_exchange',
      'request_failed',
      () =>
        fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: 'postmessage',
          }),
        }),
    );

    let tokens: GoogleTokenResponse | null;
    try {
      tokens = (await tokenResponse.json()) as GoogleTokenResponse | null;
    } catch {
      throw new GoogleAuthError(
        'token_response',
        'invalid_json',
        tokenResponse.status,
      );
    }

    if (!tokenResponse.ok) {
      const error = tokens?.error;
      const reason =
        typeof error === 'string' && knownTokenExchangeErrors.has(error)
          ? error
          : 'request_rejected';

      throw new GoogleAuthError('token_exchange', reason, tokenResponse.status);
    }

    if (typeof tokens?.id_token !== 'string' || !tokens.id_token) {
      throw new GoogleAuthError(
        'token_response',
        'missing_id_token',
        tokenResponse.status,
      );
    }

    const payload = await verifyGoogleIdToken(tokens.id_token, clientId);

    if (typeof payload.sub !== 'string' || !payload.sub) {
      throw new GoogleAuthError('identity_claims', 'missing_subject');
    }

    if (typeof payload.email !== 'string' || !payload.email) {
      throw new GoogleAuthError('identity_claims', 'missing_email');
    }

    if (payload.email_verified !== true) {
      throw new GoogleAuthError('identity_claims', 'email_not_verified');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified,
      name: payload.name,
      picture: payload.picture,
    };
    //#endregion
  }
  //#endregion

  //#region verify google id token
  async function verifyGoogleIdToken(
    idToken: string,
    expectedAudience: string,
  ): Promise<GoogleIdTokenPayload> {
    const [encodedHeader, encodedPayload, encodedSignature, extraPart] =
      idToken.split('.');

    if (
      !encodedHeader ||
      !encodedPayload ||
      !encodedSignature ||
      extraPart !== undefined
    ) {
      throw new GoogleAuthError('id_token_header', 'malformed_token');
    }

    const header = await runGoogleAuthStep(
      'id_token_header',
      'invalid_header',
      () =>
        JSON.parse(decodeBase64UrlToString(encodedHeader)) as {
          alg?: unknown;
          kid?: unknown;
        } | null,
    );

    if (header?.alg !== 'RS256') {
      throw new GoogleAuthError('id_token_header', 'unsupported_algorithm');
    }

    if (typeof header.kid !== 'string' || !header.kid) {
      throw new GoogleAuthError('id_token_header', 'missing_key_id');
    }

    const jwksResponse = await runGoogleAuthStep(
      'signing_keys',
      'request_failed',
      () => fetch('https://www.googleapis.com/oauth2/v3/certs'),
    );

    if (!jwksResponse.ok) {
      throw new GoogleAuthError(
        'signing_keys',
        'request_rejected',
        jwksResponse.status,
      );
    }

    const jwks = await runGoogleAuthStep(
      'signing_keys',
      'invalid_json',
      async () => (await jwksResponse.json()) as { keys?: GoogleJwk[] } | null,
    );

    if (!Array.isArray(jwks?.keys)) {
      throw new GoogleAuthError('signing_keys', 'invalid_key_set');
    }

    const jwk = jwks.keys.find(key => key?.kid === header.kid);

    if (!jwk) {
      throw new GoogleAuthError('signing_keys', 'key_not_found');
    }

    const publicKey = await runGoogleAuthStep(
      'signing_keys',
      'key_import_failed',
      () =>
        crypto.subtle.importKey(
          'jwk',
          jwk,
          { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
          false,
          ['verify'],
        ),
    );

    const signedData = new TextEncoder().encode(
      `${encodedHeader}.${encodedPayload}`,
    );

    const signature = await runGoogleAuthStep(
      'id_token_signature',
      'invalid_encoding',
      () => decodeBase64UrlToBytes(encodedSignature),
    );

    const validSignature = await runGoogleAuthStep(
      'id_token_signature',
      'verification_failed',
      () =>
        crypto.subtle.verify(
          'RSASSA-PKCS1-v1_5',
          publicKey,
          signature,
          signedData,
        ),
    );

    if (!validSignature) {
      throw new GoogleAuthError('id_token_signature', 'invalid_signature');
    }

    const payload = await runGoogleAuthStep(
      'id_token_claims',
      'invalid_payload',
      () =>
        JSON.parse(
          decodeBase64UrlToString(encodedPayload),
        ) as GoogleIdTokenPayload | null,
    );

    if (
      payload?.iss !== 'https://accounts.google.com' &&
      payload?.iss !== 'accounts.google.com'
    ) {
      throw new GoogleAuthError('id_token_claims', 'invalid_issuer');
    }

    const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

    if (!audiences.includes(expectedAudience)) {
      throw new GoogleAuthError('id_token_claims', 'audience_mismatch');
    }

    if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp)) {
      throw new GoogleAuthError('id_token_claims', 'invalid_expiration');
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new GoogleAuthError('id_token_claims', 'token_expired');
    }

    return payload;
  }
  //#endregion

  //#region base64 url
  function decodeBase64UrlToBytes(input: string) {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(base64 + padding);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index++) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  }

  function decodeBase64UrlToString(input: string): string {
    return new TextDecoder().decode(decodeBase64UrlToBytes(input));
  }
  //#endregion
}
