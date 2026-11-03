import { TaonSessionProvider } from '@taon-dev/session/src';
import { TaonProvider } from 'taon/src';

import { DEFAULT_EMAIL } from './app.constants';
import {
  ENV_ANGULAR_NODE_APP_CONFIG_ACCESS_TOKEN_SECRET,
  ENV_ANGULAR_NODE_APP_CONFIG_GOOGLE_CLIENT_ID,
  ENV_ANGULAR_NODE_APP_CONFIG_GOOGLE_SECRET,
  ENV_ANGULAR_NODE_APP_CONFIG_REFRESH_TOKEN_SECRET,
  ENV_ANGULAR_NODE_APP_CONFIG_SUPER_USERS,
} from './lib/env/env.angular-node-app';

//#region taon sesssion providers decorator
@TaonProvider({
  className: 'TaonSessionProvider',
})
export class TaonSessionProviderOverride extends TaonSessionProvider {
  constructor() {
    super();
    this.socialLogin.google.enabled = true;
    this.socialLogin.google.googleClientId =
      ENV_ANGULAR_NODE_APP_CONFIG_GOOGLE_CLIENT_ID;

    this.login.defaultEmail = DEFAULT_EMAIL;
    // TODO @REMOVE_THIS this is waiting for emails implementation
    this.linkSocialAccountEmail = true;
    this.administratorsEmails = ['darekf77@gmail.com'];
  }

  async _() {
    console.log('helo world!!!!!!!!!!!');

    //#region @backend
    const googleSecret = await ENV_ANGULAR_NODE_APP_CONFIG_GOOGLE_SECRET();
    this.socialLogin.google.googleSecret = googleSecret;

    this.superUsersEmails = [
      DEFAULT_EMAIL,
      ...(await ENV_ANGULAR_NODE_APP_CONFIG_SUPER_USERS()).split(','),
    ];

    console.log('active super users', this.superUsersEmails);

    this.cookies.ACCESS_TOKEN_SECRET =
      await ENV_ANGULAR_NODE_APP_CONFIG_ACCESS_TOKEN_SECRET();

    this.cookies.REFRESH_TOKEN_SECRET =
      await ENV_ANGULAR_NODE_APP_CONFIG_REFRESH_TOKEN_SECRET();
    //#endregion

    console.log('is localhost ', this.isLocalhost);

    if (this.isLocalhost) {
      this.login.diableLoginByEmail = false;
    } else {
      this.login.diableLoginByEmail = true;
    }

    await super._();
  }
}
//#endregion
