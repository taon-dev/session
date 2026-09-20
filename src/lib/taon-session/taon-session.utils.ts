export namespace TaonSessionUtils {
  interface GoogleTokenResponse {
    access_token?: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
    token_type?: string;
    id_token?: string;
    error?: string;
    error_description?: string;
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
    alg?: string;
  }

  //#region verify google authorization code
  export async function verifyGoogleAuthorizationCode(
    GOOGLE_CLIENT_ID: string,
    GOOGLE_CLIENT_SECRET: string,
    code: string,
  ) {
    //#region @backendFunc

    // ---------------------------------------------------------
    // 1. Exchange authorization code for tokens
    // ---------------------------------------------------------

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',

        // Important:
        // must match what was used when obtaining the code.
        redirect_uri: 'postmessage',
      }),
    });

    const tokens = (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenResponse.ok) {
      throw new Error(
        `Google token exchange failed: ${
          tokens.error_description || tokens.error || tokenResponse.statusText
        }`,
      );
    }

    if (!tokens.id_token) {
      throw new Error('Google did not return an ID token.');
    }

    // ---------------------------------------------------------
    // 2. Verify Google ID token
    // ---------------------------------------------------------

    const payload = await verifyGoogleIdToken(
      tokens.id_token,
      GOOGLE_CLIENT_ID,
    );

    // ---------------------------------------------------------
    // 3. Validate required identity data
    // ---------------------------------------------------------

    if (!payload.sub) {
      throw new Error('Google identity does not contain sub.');
    }

    if (!payload.email) {
      throw new Error('Google identity does not contain email.');
    }

    if (!payload.email_verified) {
      throw new Error('Google email is not verified.');
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
    const parts = idToken.split('.');

    if (parts.length !== 3) {
      throw new Error('Invalid Google ID token.');
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    const header = JSON.parse(decodeBase64UrlToString(encodedHeader)) as {
      alg?: string;
      kid?: string;
    };

    if (header.alg !== 'RS256') {
      throw new Error(`Unsupported Google JWT algorithm: ${header.alg}`);
    }

    if (!header.kid) {
      throw new Error('Google ID token does not contain kid.');
    }

    // ---------------------------------------------------------
    // Google's public signing keys
    // ---------------------------------------------------------

    const jwksResponse = await fetch(
      'https://www.googleapis.com/oauth2/v3/certs',
    );

    if (!jwksResponse.ok) {
      throw new Error('Unable to download Google signing keys.');
    }

    const jwks = (await jwksResponse.json()) as {
      keys: GoogleJwk[];
    };

    const jwk = jwks.keys.find(key => key.kid === header.kid);

    if (!jwk) {
      throw new Error('Google signing key not found.');
    }

    // ---------------------------------------------------------
    // Import RSA public key
    // ---------------------------------------------------------

    const publicKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['verify'],
    );

    // ---------------------------------------------------------
    // Verify JWT signature
    // ---------------------------------------------------------

    const signedData = new TextEncoder().encode(
      `${encodedHeader}.${encodedPayload}`,
    );

    const signature = decodeBase64UrlToBytes(encodedSignature);

    const validSignature = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      // @ts-ignore
      signature,
      signedData,
    );

    if (!validSignature) {
      throw new Error('Invalid Google ID token signature.');
    }

    // ---------------------------------------------------------
    // Decode + validate claims
    // ---------------------------------------------------------

    const payload = JSON.parse(
      decodeBase64UrlToString(encodedPayload),
    ) as GoogleIdTokenPayload;

    if (
      payload.iss !== 'https://accounts.google.com' &&
      payload.iss !== 'accounts.google.com'
    ) {
      throw new Error(`Invalid Google token issuer: ${payload.iss}`);
    }

    const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];

    if (!audiences.includes(expectedAudience)) {
      throw new Error('Google ID token audience mismatch.');
    }

    const now = Math.floor(Date.now() / 1000);

    if (!payload.exp || payload.exp <= now) {
      throw new Error('Google ID token has expired.');
    }

    return payload;
  }
  //#endregion

  //#region base64 url
  function decodeBase64UrlToBytes(input: string): Uint8Array {
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');

    base64 += '='.repeat((4 - (base64.length % 4)) % 4);

    const binary = atob(base64);

    const result = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      result[i] = binary.charCodeAt(i);
    }

    return result;
  }

  function decodeBase64UrlToString(input: string): string {
    return new TextDecoder().decode(decodeBase64UrlToBytes(input));
  }
  //#endregion
}
