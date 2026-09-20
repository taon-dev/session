import { OAuth2Client } from 'google-auth-library';
export namespace TaonSessionUtils {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  export async function verifyGoogleAuthorizationCode(
    GOOGLE_CLIENT_ID: string,
    GOOGLE_CLIENT_SECRET: string,
    code: string,
  ) {
    //#region @backendFunc
    const googleClient = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      'postmessage',
    );

    const { tokens } = await googleClient.getToken(code);

    if (!tokens.id_token) {
      throw new Error('Google did not return an ID token.');
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid Google identity token.');
    }

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
}
