//#region imports
import {
  Taon,
  TaonAdditionalMiddlewareMethodInfo,
  TaonBaseMiddleware,
  TaonMiddleware,
  TaonServerMiddlewareInterceptOptions,
} from 'taon/src';
import { _, UtilsJwt } from 'tnp-core/src';

import { TaonSessionKvRepository } from './taon-session.kv.repository';
import { TaonSessionProvider } from './taon-session.provider';
import { TaonSessionRepository } from './taon-session.repository';
//#endregion

@TaonMiddleware({
  className: 'TaonSessionMiddleware',
})
export class TaonSessionMiddleware extends TaonBaseMiddleware {
  taonSessionRepository = this.injectCustomRepo(TaonSessionRepository);

  //#region intercept server method
  async interceptServerMethod(
    data: TaonServerMiddlewareInterceptOptions,
  ): Promise<void> {
    //#region @backend
    await this.taonSessionRepository.throwIfNotAuthenticated(data);
    //#endregion
  }
  //#endregion
}
