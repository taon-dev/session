//#region imports
import * as jwt from 'jsonwebtoken'; // @backend
import {
  Taon,
  TaonAdditionalMiddlewareMethodInfo,
  TaonBaseMiddleware,
  TaonMiddleware,
  TaonServerMiddlewareInterceptOptions,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonSessionKvRepository } from './taon-session-kv.repository';
import { TaonSessionProvider } from './taon-session.provider';
//#endregion

@TaonMiddleware({
  className: 'TaonSessionMiddleware',
})
export class TaonSessionMiddleware extends TaonBaseMiddleware {
  taonSessionKvRepository = this.injectKvRepository(TaonSessionKvRepository);

  taonSessionProvider = this.injectProvider(TaonSessionProvider);

  interceptServerMethod(
    { req, res, next }: TaonServerMiddlewareInterceptOptions,
    {
      methodName,
      expressPath,
      httpRequestType,
    }: TaonAdditionalMiddlewareMethodInfo,
  ): Promise<void> | void {
    //#region @backend
    const token = this.taonSessionKvRepository.getTokenFromRequest(req);

    if (!token) {
      res.status(401).json({ message: 'No token' });
      return;
    }

    try {
      const payload = jwt.verify(
        token,
        this.taonSessionProvider.ACCESS_TOKEN_SECRET,
      ) as any;
      (req as any).userId = payload.userId;
      next();
    } catch (err) {
      console.log(err);
      res.status(401).json({ message: 'Invalid token' });
    }
    //#endregion
  }
}
