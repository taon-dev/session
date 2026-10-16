//#region imports
import { FetchResponse } from 'ng2-rest/src';
import { Observable } from 'rxjs';
import {
  Taon,
  TaonAdditionalMiddlewareMethodInfo,
  TaonBaseMiddleware,
  TaonClientMiddlewareInterceptOptions,
  TaonMiddleware,
  TaonServerMiddlewareInterceptOptions,
} from 'taon/src';
import { _, UtilsJwt } from 'tnp-core/src';

import { TaonSessionController } from './taon-session.controller';
import { TaonSessionKvRepository } from './taon-session.kv.repository';
import { TaonSessionProvider } from './taon-session.provider';
import { TaonSessionRepository } from './taon-session.repository';

//#endregion

@TaonMiddleware({
  className: 'TaonSessionMiddleware',
})
export class TaonSessionMiddleware extends TaonBaseMiddleware {
  taonSessionRepository = this.injectCustomRepo(TaonSessionRepository);

  taonSessionController = this.injectCustomRepo(TaonSessionController);

  //#region intercept server method
  async interceptServerMethod(
    data: TaonServerMiddlewareInterceptOptions,
  ): Promise<void> {
    //#region @backend
    await this.taonSessionRepository.throwIfNotAuthenticated(data);
    //#endregion
  }
  //#endregion

  /**
   * Global whole context angular interceptor for reauthentication.
   * when request get 401 - interceptor will try to .refresh() cookie on
   * server.
   */
  interceptClient({
    req,
    next,
  }: TaonClientMiddlewareInterceptOptions): Observable<FetchResponse> {
    // console.log(`intercept req.reauthenticateOn401`, req.reauthenticateOn401);
    // console.log(`intercept req.url`, req);
    if (req.reauthenticateOn401 !== null) {
      // console.log('replacing auth tryRefreshAccessToken for '+ req.url);
      req.reauthenticateOn401 = async () => {
        return await this.taonSessionController.tryRefreshAccessToken();
      };
    }
    return next.handle(req);
  }
}
