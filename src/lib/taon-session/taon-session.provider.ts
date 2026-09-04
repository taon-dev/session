import { TaonBaseProvider, TaonProvider } from 'taon/src';

//#region config classes

//#region config classes / cookies

export class TaonSessionCookiesConfig {
  declare public accessTokenCookieName: string;

  declare public refreshTokenCookieName: string;

  declare public sameSite: 'lax' | 'strict' | 'none';

  declare public secure: boolean;

  declare public httpOnly: boolean;

  constructor() {
    this.accessTokenCookieName = 'taon_access_token';
    this.refreshTokenCookieName = 'taon_refresh_token';

    this.sameSite = 'lax';

    this.secure = true;

    this.httpOnly = true;
  }
}
//#endregion

//#region config classes / password requirements
export class TaonSessionPasswordRequirementsConfig {
  declare public minLength: number;

  declare public maxLength: number;

  declare public requireLowercase: boolean;

  declare public requireUppercase: boolean;

  declare public requireNumber: boolean;

  declare public requireSpecialCharacter: boolean;

  declare public specialCharacters: string;

  constructor() {
    this.minLength = 8;
    this.maxLength = 128;

    this.requireLowercase = false;
    this.requireUppercase = false;
    this.requireNumber = false;
    this.requireSpecialCharacter = false;

    this.specialCharacters = '!@#$%^&*';
  }
}
//#endregion

//#region config classes / registration requirements
export class TaonSessionRegistrationConfig {
  /**
   * ⌛ TODO in progress
   */
  declare public enabled: boolean;

  /**
   * ⌛ TODO in progress
   */
  declare public requireEmailConfirmation: boolean;

  /**
   * ⌛ TODO in progress
   * Registration allowed only when user has
   * invitation code / registration password.
   */
  declare public requireRegistrationPassword: boolean;

  /**
   * ⌛ TODO in progress
   */
  declare public allowDuplicateEmail: boolean;

  constructor() {
    this.enabled = true;
    this.requireEmailConfirmation = true;
    this.requireRegistrationPassword = false;
    this.allowDuplicateEmail = false;
  }
}
//#endregion

//#region config classes / login config
export class TaonSessionLoginConfig {
  declare public allowEmailPassword: boolean;

  /**
   * Whether FE may check whether email exists
   * before showing password/register screen.
   */
  declare public exposeEmailExistence: boolean;

  declare public rememberMe: boolean;

  constructor() {
    this.allowEmailPassword = true;
    this.exposeEmailExistence = true;
    this.rememberMe = true;
  }
}
//#endregion

//#region config classes / check if human config
export class TaonSessionCheckIfHumanConfig {
  declare public duringLoginRegisterEmail: boolean;

  declare public duringRegistrationPassword: boolean;

  declare public duringLoginPassword: boolean;

  declare public duringPasswordReset: boolean;

  constructor() {
    this.duringLoginRegisterEmail = false;
    this.duringRegistrationPassword = false;
    this.duringLoginPassword = false;

    this.duringPasswordReset = false;
  }
}
//#endregion

//#region config classes / social login config
export class TaonSessionSocialLoginConfig {
  declare public google: boolean;

  declare public facebook: boolean;

  declare public microsoft: boolean;

  declare public apple: boolean;

  constructor() {
    this.google = false;
    this.facebook = false;
    this.microsoft = false;
    this.apple = false;
  }
}
//#endregion

//#region config classes / sessions
export class TaonSessionSessionsConfig {
  /**
   * Multiple devices / browsers may stay logged in.
   */
  declare public allowMultipleSessions: boolean;

  /**
   * 0 = unlimited
   */
  declare public maxSessionsPerUser: number;

  /**
   * Update last activity timestamp.
   */
  declare public trackActivity: boolean;

  /**
   * Optional idle timeout.
   * 0 = disabled
   */
  declare public idleTimeoutSeconds: number;

  constructor() {
    this.allowMultipleSessions = true;
    this.maxSessionsPerUser = 0;
    this.trackActivity = true;
    this.idleTimeoutSeconds = 0;
  }
}
//#endregion

//#region config classes / password recovery config
export class TaonSessionPasswordRecoveryConfig {
  declare public enabled: boolean;

  declare public tokenExpiresSeconds: number;

  declare public invalidateExistingSessionsAfterReset: boolean;

  constructor() {
    this.enabled = true;
    this.tokenExpiresSeconds = 60 * 60; // 1h
    this.invalidateExistingSessionsAfterReset = true;
  }
}
//#endregion

//#region config classes / email confirmation config
export class TaonSessionEmailConfirmationConfig {
  declare public enabled: boolean;

  declare public tokenExpiresSeconds: number;

  declare public allowResend: boolean;

  declare public resendCooldownSeconds: number;

  constructor() {
    this.enabled = true;
    this.tokenExpiresSeconds = 60 * 60 * 24; // 24h
    this.allowResend = true;
    this.resendCooldownSeconds = 60;
  }
}
//#endregion

//#region config classes / security config
export class TaonSessionSecurityConfig {
  /**
   * Logout all sessions after password change.
   */
  declare public invalidateSessionsAfterPasswordChange: boolean;

  /**
   * Rotate refresh token after successful refresh.
   */
  declare public rotateRefreshTokens: boolean;

  /**
   * Detect reuse of already rotated refresh tokens.
   */
  declare public detectRefreshTokenReuse: boolean;

  constructor() {
    this.invalidateSessionsAfterPasswordChange = true;
    this.rotateRefreshTokens = true;
    this.detectRefreshTokenReuse = true;
  }
}
//#endregion

//#region config classes / rate limit config
export class TaonSessionRateLimitConfig {
  declare public maxAttempts: number;

  declare public windowSeconds: number;

  constructor(maxAttempts: number, windowSeconds: number) {
    this.maxAttempts = maxAttempts;
    this.windowSeconds = windowSeconds;
  }
}
//#endregion

//#region config classes / rate limits config
export class TaonSessionRateLimitsConfig {
  declare public loginAttempts: TaonSessionRateLimitConfig;

  declare public passwordReset: TaonSessionRateLimitConfig;

  declare public emailConfirmationResend: TaonSessionRateLimitConfig;

  constructor() {
    this.loginAttempts = new TaonSessionRateLimitConfig(10, 60);

    this.passwordReset = new TaonSessionRateLimitConfig(5, 60 * 60);

    this.emailConfirmationResend = new TaonSessionRateLimitConfig(5, 60 * 60);
  }
}
//#endregion

//#endregion

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
  cookies = new TaonSessionCookiesConfig();

  //#endregion

  //#region password

  /**
   * ⌛ TODO in progress
   */
  passwordRequirements = new TaonSessionPasswordRequirementsConfig();

  //#endregion

  //#region registration

  /**
   * ⌛ TODO in progress
   */
  registration = new TaonSessionRegistrationConfig();

  //#endregion

  //#region login

  /**
   * ⌛ TODO in progress
   */
  login = new TaonSessionLoginConfig();

  //#endregion

  //#region human verification

  /**
   * ⌛ TODO in progress
   */
  checkIfHuman = new TaonSessionCheckIfHumanConfig();

  //#endregion

  //#region social login

  /**
   * ⌛ TODO in progress
   */
  socialLogin = new TaonSessionSocialLoginConfig();

  //#endregion

  //#region sessions

  /**
   * ⌛ TODO in progress
   */
  sessions = new TaonSessionSessionsConfig();

  //#endregion

  //#region password recovery

  /**
   * ⌛ TODO in progress
   */
  passwordRecovery = new TaonSessionPasswordRecoveryConfig();

  //#endregion

  //#region email confirmation

  /**
   * ⌛ TODO in progress
   */
  emailConfirmation = new TaonSessionEmailConfirmationConfig();

  //#endregion

  //#region security

  /**
   * ⌛ TODO in progress
   */
  security = new TaonSessionSecurityConfig();

  //#endregion

  //#region rate limits

  /**
   * ⌛ TODO in progress
   */
  rateLimits = new TaonSessionRateLimitsConfig();

  //#endregion
}
