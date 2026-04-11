//#region imports
import { Taon, TaonBaseProvider, TaonProvider } from 'taon/src';
import { _ } from 'tnp-core/src';
//#endregion

@TaonProvider({
  className: 'TaonSessionProvider',
})
export class TaonSessionProvider extends TaonBaseProvider {
  ACCESS_TOKEN_SECRET = 'access-secret';

  REFRESH_TOKEN_SECRET = 'refresh-secret';

  ACCESS_TOKEN_EXPIRES = '15m';

  REFRESH_TOKEN_EXPIRES_SECONDS = 60 * 60 * 24 * 7; // 7 days
}
