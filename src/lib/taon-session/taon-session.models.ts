import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export interface TaonLoginData {
  email?: string;
  password?: string;
}

export interface TaonLoginConfig {
  googleClientId?: string;
  microsoftClientId?: string;
  diableLoginByEmail?: boolean;
  defaultEmail?: string;
  defaultPassword?: string;
  enable2faEmail?: boolean;
  enable2faAuthenticator?: boolean;
  linkToDashboard: string;
  displayDashboardButton?: boolean;
}

export enum TaonSessionState {
  LOADING_INITIAL_AUTH_INFO = 'LOADING_INITIAL_AUTH_INFO',
  LOGIN_OR_REGISTER = 'LOGIN_OR_REGISTER',
  ENTER_PASSWORD = 'ENTER_PASSWORD',
  ENTER_REGISTRATION_PASSWORDS = 'ENTER_REGISTRATION_PASSWORDS',
  LOADING_AUTH = 'LOADING_AUTH',
  LOADING_CHECK_USER_EMAIL_EXISTS = 'LOADING_CHECK_USER_EMAIL_EXISTS',
  LOADING_CREATING_USER = 'LOADING_CREATING_USER',
  LOADING_LOGOUT_INFO = 'LOADING_LOGOUT_INFO',
  TWO_FA_EMAIL = 'TWO_FA_EMAIL',
  TWO_FA_SMS = 'TWO_FA_SMS',
  TWO_FA_AUTHENTICATOR = 'TWO_FA_AUTHENTICATOR',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
}

export enum TaonLoginErrors {
  INVALID_PASSWORD = 'INVALID_PASSWORD',
  PASSWORDS_DO_NOT_MATCH = 'PASSWORDS_DO_NOT_MATCH',
}

export const TaonErorsMap = new Map([
  [TaonLoginErrors.INVALID_PASSWORD, t.gettext('Invalid Password')],
  [
    TaonLoginErrors.PASSWORDS_DO_NOT_MATCH,
    t.gettext('Passwords do not match each other'),
  ],
]);
