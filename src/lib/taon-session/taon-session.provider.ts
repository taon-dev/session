import { TaonBaseProvider, TaonProvider } from 'taon/src';

@TaonProvider({
  className: 'TaonSessionProvider',
})
export class TaonSessionProvider extends TaonBaseProvider {
  //#region @backend

  /**
   * ⌛ TODO move to cookies
   */
  ACCESS_TOKEN_SECRET = 'access-secret';

  /**
   * ⌛ TODO move to cookies
   */
  REFRESH_TOKEN_SECRET = 'refresh-secret';

  //#endregion

  //#region tokens
  /**
   * ⌛ TODO move to cookies
   */
  ACCESS_TOKEN_EXPIRES = '15m';

  /**
   * ⌛ TODO move to cookies
   */
  REFRESH_TOKEN_EXPIRES_SECONDS = 60 * 60 * 24 * 7;

  //#endregion

  //#region cookies

  /**
   * ⌛ TODO in progress
   */
  // cookies = {
  //   accessTokenCookieName: 'taon_access_token',
  //   refreshTokenCookieName: 'taon_refresh_token',

  //   sameSite: 'lax' as 'lax' | 'strict' | 'none',

  //   secure: true,

  //   httpOnly: true,
  // };

  //#endregion

  //#region password

  /**
   * ⌛ TODO in progress
   */
  passwordRequirements = {
    minLength: 8,
    maxLength: 128,

    requireLowercase: false,
    requireUppercase: false,
    requireNumber: false,
    requireSpecialCharacter: false,

    specialCharacters: '!@#$%^&*',
  };

  //#endregion

  //#region registration
  /**
   * ⌛ TODO in progress
   */
  registration = {
    /**
     * ⌛ TODO in progress
     */
    enabled: true,

    /**
     * ⌛ TODO in progress
     */
    requireEmailConfirmation: true,

    /**
     * ⌛ TODO in progress
     * Registration allowed only when user has
     * invitation code / registration password.
     */
    requireRegistrationPassword: false,

    /**
     * ⌛ TODO in progress
     */
    allowDuplicateEmail: false,
  };

  //#endregion

  //#region login

  /**
   * ⌛ TODO in progress
   */
  login = {
    allowEmailPassword: true,

    /**
     * Whether FE may check whether email exists
     * before showing password/register screen.
     */
    exposeEmailExistence: true,

    rememberMe: true,
  };

  //#endregion

  //#region human verification

  /**
   * ⌛ TODO in progress
   */
  checkIfHuman = {
    duringLoginRegisterEmail: false,
    duringRegistrationPassword: false,
    duringLoginPassword: false,

    duringPasswordReset: false,
  };

  //#endregion

  //#region social login

  /**
   * ⌛ TODO in progress
   */
  socialLogin = {
    google: false,
    facebook: false,
    microsoft: false,
    apple: false,
  };

  //#endregion

  //#region sessions

  /**
   * ⌛ TODO in progress
   */
  sessions = {
    /**
     * Multiple devices / browsers may stay logged in.
     */
    allowMultipleSessions: true,

    /**
     * 0 = unlimited
     */
    maxSessionsPerUser: 0,

    /**
     * Update last activity timestamp.
     */
    trackActivity: true,

    /**
     * Optional idle timeout.
     * 0 = disabled
     */
    idleTimeoutSeconds: 0,
  };

  //#endregion

  //#region password recovery
  /**
   * ⌛ TODO in progress
   */
  passwordRecovery = {
    enabled: true,

    tokenExpiresSeconds: 60 * 60, // 1h

    invalidateExistingSessionsAfterReset: true,
  };

  //#endregion

  //#region email confirmation

  /**
   * ⌛ TODO in progress
   */
  emailConfirmation = {
    enabled: true,

    tokenExpiresSeconds: 60 * 60 * 24, // 24h

    allowResend: true,

    resendCooldownSeconds: 60,
  };

  //#endregion

  //#region security
  /**
   * ⌛ TODO in progress
   */
  security = {
    /**
     * Logout all sessions after password change.
     */
    invalidateSessionsAfterPasswordChange: true,

    /**
     * Rotate refresh token after successful refresh.
     */
    rotateRefreshTokens: true,

    /**
     * Detect reuse of already rotated refresh tokens.
     */
    detectRefreshTokenReuse: true,
  };

  //#endregion

  //#region rate limits

  /**
   * ⌛ TODO in progress
   */
  rateLimits = {
    loginAttempts: {
      maxAttempts: 10,
      windowSeconds: 60,
    },

    passwordReset: {
      maxAttempts: 5,
      windowSeconds: 60 * 60,
    },

    emailConfirmationResend: {
      maxAttempts: 5,
      windowSeconds: 60 * 60,
    },
  };

  //#endregion
}
