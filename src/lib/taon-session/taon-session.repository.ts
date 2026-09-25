//#region imports
import {
  getStatusCode,
  getStatusText,
  HttpStatusEnum,
  Taon,
  TaonBaseRepository,
  TaonRepository,
  TaonServerMiddlewareInterceptOptions,
} from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonSessionEntity } from './taon-session.entity';
import { TaonSessionKvRepository } from './taon-session.kv.repository';
import { UtilsJwt } from 'tnp-core/src';
import { TaonSessionProvider } from './taon-session.provider';
//#endregion

@TaonRepository({
  className: 'TaonSessionRepository',
})
export class TaonSessionRepository extends TaonBaseRepository<TaonSessionEntity> {
  entityClassResolveFn: () => typeof TaonSessionEntity = () =>
    TaonSessionEntity;

  private readonly taonSessionKvRepository = this.injectKvRepository(
    TaonSessionKvRepository,
  );

  private readonly taonSessionProvider =
    this.injectProvider(TaonSessionProvider);

  async throwIfNotAuthenticated({
    req,
    res,
    next,
  }: Pick<TaonServerMiddlewareInterceptOptions, 'req' | 'res'> &
    Partial<
      Pick<TaonServerMiddlewareInterceptOptions, 'next'>
    >): Promise<void> {
    //#region @websqlFunc
    if (!next) {
      next = () => void 0;
    }
    const token = this.taonSessionKvRepository.getTokenFromRequest(req);

    if (!token) {
      Taon.error({
        message: getStatusText(HttpStatusEnum.NO_TOKEN),
        code: getStatusCode(HttpStatusEnum.NO_TOKEN),
      });
      return;
    }

    try {
      const payload = (await UtilsJwt.verify(
        token,
        this.taonSessionProvider.cookies.ACCESS_TOKEN_SECRET,
      )) as any;
      (req as any).userId = payload.userId;

      next();
    } catch (err) {
      Taon.error({
        message: getStatusText(HttpStatusEnum.INVALID_TOKEN),
        code: getStatusCode(HttpStatusEnum.INVALID_TOKEN),
      });
    }
    //#endregion
  }
}
