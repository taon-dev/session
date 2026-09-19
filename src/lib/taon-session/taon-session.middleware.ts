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
//#endregion

@TaonMiddleware({
  className: 'TaonSessionMiddleware',
})
export class TaonSessionMiddleware extends TaonBaseMiddleware {
  taonSessionKvRepository = this.injectKvRepository(TaonSessionKvRepository);

  taonSessionProvider = this.injectProvider(TaonSessionProvider);

  //#region intercept server method
  async interceptServerMethod(
    { req, res, next }: TaonServerMiddlewareInterceptOptions,
    {
      methodName,
      expressPath,
      httpRequestType,
    }: TaonAdditionalMiddlewareMethodInfo,
  ): Promise<void> {
    //#region @backend
    const token = this.taonSessionKvRepository.getTokenFromRequest(req);

    if (!token) {
      res.status(401).json({ message: 'No token' });
      return;
    }

    try {
      const payload = await UtilsJwt.verify(
        token,
        this.taonSessionProvider.cookies.ACCESS_TOKEN_SECRET,
      ) as any;
      (req as any).userId = payload.userId;
      next();
    } catch (err) {
      console.log(err);
      res.status(401).json({ message: 'Invalid token' });
    }
    //#endregion
  }
  //#endregion
}
