import { Injectable } from '@angular/core';
import { TaonBaseClass, TaonBaseProvider, TaonProvider } from 'taon/src';
import { CoreModels, GlobalStorage, UtilsOs, _ } from 'tnp-core/src';

//#region config classes

//#region config classes / cookies
const isProduction =
  !GlobalStorage.get('TAON_LOCAL_DEV') &&
  (UtilsOs.isRunningInDocker() || UtilsOs.isRunningInCloudflareWorker());

export class TaonSessionCookiesConfig extends TaonBaseClass {
  declare public ACCESS_TOKEN_SECRET: string;

  declare public REFRESH_TOKEN_SECRET: string;

  declare public ACCESS_TOKEN_EXPIRES: string;

  declare public REFRESH_TOKEN_EXPIRES_SECONDS: number;

  declare public accessTokenCookieName: string;

  declare public refreshTokenCookieName: string;

  declare public sameSite: 'lax' | 'strict' | 'none';

  declare public secure: boolean;

  declare public httpOnly: boolean;

  constructor() {
    super();
    //#region @backend
    this.ACCESS_TOKEN_SECRET = 'access-secret';
    this.REFRESH_TOKEN_SECRET = 'refresh-secret';
    //#endregion
    this.ACCESS_TOKEN_EXPIRES = '15m';
    this.REFRESH_TOKEN_EXPIRES_SECONDS = 60 * 60 * 24 * 7;
    this.accessTokenCookieName = 'taon_access_token';
    this.refreshTokenCookieName = 'taon_refresh_token';
    this.sameSite = 'lax';

    this.secure = isProduction;

    this.httpOnly = true;
  }
}
//#endregion

//#region config classes / social login config
export class TaonSessionSocialLoginConfig extends TaonBaseClass {
  declare public google: {
    enabled?: boolean;
    googleClientId?: string;
  };

  declare public facebook: {
    enabled?: boolean;
    facebookClientId?: string;
  };

  declare public microsoft: {
    enabled?: boolean;
    microsoftClientId?: string;
  };

  declare public apple: {
    enabled?: boolean;
    appleClientId?: string;
  };

  constructor() {
    super();
    this.google = {
      enabled: false,
    };
    this.facebook = {
      enabled: false,
    };
    this.microsoft = {
      enabled: false,
    };
    this.apple = {
      enabled: false,
    };
  }

  public get isAnySocialLoginEnabled(): boolean {
    return (
      this.google.enabled ||
      this.microsoft.enabled ||
      this.facebook.enabled ||
      this.apple.enabled
    );
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
    this.requireEmailConfirmation = false;
    this.requireRegistrationPassword = true;
    this.allowDuplicateEmail = false;
  }
}
//#endregion

//#region config classes / login config
export class TaonSessionLoginConfig extends TaonBaseClass {
  declare public diableLoginByEmail: boolean;

  declare public defaultEmail?: string;

  declare public defaultPassword?: string;

  declare public linkToDashboard: string;

  declare public displayDashboardButton: boolean;

  /**
   * TODO
   * Whether FE may check whether email exists
   * before showing password/register screen.
   */
  // declare public exposeEmailExistence: boolean;

  /**
   * TODO
   */
  // declare public rememberMe: boolean;

  constructor() {
    super();
    this.diableLoginByEmail = false;
    this.linkToDashboard = '/';
    this.displayDashboardButton = true;
    // this.exposeEmailExistence = true;
    // this.rememberMe = true;
    if (isProduction) {
      delete this.defaultEmail;
      delete this.defaultPassword;
    }
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

export type TaonSessionConfig = Omit<
  CoreModels.DeepPartial<TaonSessionProvider>,
  | 'ctx'
  | '_'
  | 'getOriginalPrototype'
  | 'getOriginalConstructor'
  | '__endpoint_context__'
>;

@TaonProvider({
  className: 'TaonSessionProvider',
})
export class TaonSessionProvider extends TaonBaseProvider {
  cookies = new TaonSessionCookiesConfig();

  login = new TaonSessionLoginConfig();

  socialLogin = new TaonSessionSocialLoginConfig();

  // passwordRequirements = new TaonSessionPasswordRequirementsConfig();

  // registration = new TaonSessionRegistrationConfig();

  // checkIfHuman = new TaonSessionCheckIfHumanConfig();

  // socialLogin = new TaonSessionSocialLoginConfig();

  // sessions = new TaonSessionSessionsConfig();

  // passwordRecovery = new TaonSessionPasswordRecoveryConfig();

  // emailConfirmation = new TaonSessionEmailConfirmationConfig();

  // security = new TaonSessionSecurityConfig();

  // rateLimits = new TaonSessionRateLimitsConfig();

  clone(): TaonSessionConfig {
    return {
      cookies: this.cookies.clone(),
      login: this.login.clone(),
      socialLogin: this.socialLogin.clone(),
    };
  }
}
