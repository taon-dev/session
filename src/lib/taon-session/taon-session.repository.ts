//#region imports
import {
  ExpressRequest,
  ExpressResponse,
  getStatusCode,
  getStatusText,
  HttpStatusEnum,
  Taon,
  TaonBaseRepository,
  TaonRepository,
  TaonServerMiddlewareInterceptOptions,
} from 'taon/src';
import { Raw } from 'taon-typeorm/src';
import { UtilsJwt } from 'tnp-core/src';

import { TaonSessionEntity } from './taon-session.entity';
import { TaonSessionKvRepository } from './taon-session.kv.repository';
import { TaonSessionProvider } from './taon-session.provider';
//#endregion

@TaonRepository({
  className: 'TaonSessionRepository',
})
export class TaonSessionRepository extends TaonBaseRepository<TaonSessionEntity> {
  //#region fields & getters
  debug = true;

  entityClassResolveFn: () => typeof TaonSessionEntity = () =>
    TaonSessionEntity;

  private readonly taonSessionKvRepository = this.injectKvRepository(
    TaonSessionKvRepository,
  );

  private readonly taonSessionProvider =
    this.injectProvider(TaonSessionProvider);
  //#endregion

  //#region create session entity
  async createSession(
    partialSessino: Partial<TaonSessionEntity>,
  ): Promise<TaonSessionEntity> {
    //#region @websqlFunc
    let session = new TaonSessionEntity().clone(partialSessino);
    session = await this.save(session);
    return session;
    //#endregion
  }
  //#endregion

  //#region require active session
  async requireActiveSession(
    sessionId: number,
    userId: number,
  ): Promise<TaonSessionEntity> {
    //#region @websqlFunc
    const session = await this.findOne({
      select: { id: true, userId: true, revokedAt: true, expiresAt: true },
      where: { id: sessionId, userId },
    });
    // console.log('requireActiveSession', {
    //   sessionId,
    //   userId,
    // });

    if (
      !session ||
      session.revokedAt ||
      !session.expiresAt ||
      new Date(session.expiresAt).getTime() <= Date.now()
    ) {
      Taon.error({
        context: 'requireActiveSession',
        code: HttpStatusEnum.INVALID_TOKEN,
        message: getStatusText(HttpStatusEnum.INVALID_TOKEN),
        status: getStatusCode(HttpStatusEnum.INVALID_TOKEN),
      });
    }
    return session;
    //#endregion
  }
  //#endregion

  //#region touch session
  async touchSession(
    sessionId: number,
    userId: number,
    refresh = false,
  ): Promise<void> {
    //#region @websqlFunc
    await this.requireActiveSession(sessionId, userId);
    await this.repo.update(
      { id: sessionId, userId },
      {
        lastActivityAt: new Date(),
        ...(refresh
          ? {
              expiresAt: new Date(
                Date.now() +
                  this.taonSessionProvider.cookies
                    .REFRESH_TOKEN_EXPIRES_SECONDS *
                    1000,
              ),
            }
          : {}),
      },
    );
    //#endregion
  }
  //#endregion

  //#region revoke session
  async revokeSession(sessionId: number, userId: number): Promise<void> {
    //#region @websqlFunc
    await this.repo.update(
      { id: sessionId, userId },
      {
        revokedAt: new Date(),
        revokeReason: 'logout',
      },
    );
    //#endregion
  }
  //#endregion

  //#region get session by id
  async getSessionBy(
    sessionId?: number | string,
  ): Promise<TaonSessionEntity | null> {
    //#region @websqlFunc
    if (!sessionId) {
      return null;
    }
    const session = await this.findOneBy({
      id: Number(sessionId),
    });
    return session;
    //#endregion
  }
  //#endregion

  //#region throw if not authroized
  async throwIfNotAuthenticated({
    req,
    res,
    next,
  }: Pick<TaonServerMiddlewareInterceptOptions, 'req' | 'res'> &
    Partial<Pick<TaonServerMiddlewareInterceptOptions, 'next'>>): Promise<{
    userId?: string | number;
    sessionId?: string | number;
  }> {
    //#region @websqlFunc
    if (!next) {
      next = () => void 0;
    }
    const token = this.taonSessionKvRepository.getTokenFromRequest(req);

    if (!token) {
      Taon.error({
        message: getStatusText(HttpStatusEnum.NO_TOKEN),
        context: 'getTokenFromRequest',
        code: HttpStatusEnum.NO_TOKEN,
        status: getStatusCode(HttpStatusEnum.NO_TOKEN),
      });
      return;
    }

    let payload: UtilsJwt.JwtPayload;
    try {
      payload = await UtilsJwt.verify(
        token,
        this.taonSessionProvider.cookies.ACCESS_TOKEN_SECRET,
      );
    } catch (err) {
      Taon.error({
        context: 'throwIfNotAuthenticated',
        code: HttpStatusEnum.INVALID_TOKEN,
        message: getStatusText(HttpStatusEnum.INVALID_TOKEN),
        status: getStatusCode(HttpStatusEnum.INVALID_TOKEN),
      });
      return {};
    }
    if (
      typeof payload.userId !== 'number' ||
      !Number.isSafeInteger(payload.userId) ||
      payload.userId <= 0
    ) {
      Taon.error({
        context: 'throwIfNotAuthenticated',
        code: HttpStatusEnum.INVALID_TOKEN,
        message: getStatusText(HttpStatusEnum.INVALID_TOKEN),
        status: getStatusCode(HttpStatusEnum.INVALID_TOKEN),
      });
      return {};
    }
    if (payload.sessionId !== undefined) {
      if (
        typeof payload.sessionId !== 'number' ||
        !Number.isSafeInteger(payload.sessionId) ||
        payload.sessionId <= 0
      ) {
        Taon.error({
          context: 'throwIfNotAuthenticated',
          code: HttpStatusEnum.INVALID_TOKEN,
          message: getStatusText(HttpStatusEnum.INVALID_TOKEN),
          status: getStatusCode(HttpStatusEnum.INVALID_TOKEN),
        });
        return {};
      }
      await this.touchSession(payload.sessionId, payload.userId);
    }
    Object.assign(req, {
      userId: payload.userId,
      sessionId: payload.sessionId,
    });
    next();
    //#endregion
  }
  //#endregion

  //#region try refresh access token
  async tryRefreshAccessToken(
    req: ExpressRequest,
    res: ExpressResponse,
    opt: { throwErrors: boolean },
  ): Promise<boolean> {
    //#region @websqlFunc
    opt = opt || { throwErrors: false };
    const token = (req!.cookies || {})[
      this.taonSessionProvider.cookies.refreshTokenCookieName
    ]; //

    if (!token) {
      if (opt.throwErrors) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.NO_REFRESH_TOKEN),
          context: 'refresh',
          code: HttpStatusEnum.NO_REFRESH_TOKEN,
          message: getStatusText(HttpStatusEnum.NO_REFRESH_TOKEN),
        });
      } else {
        this.debug && console.log('Not refrehs token');
      }

      return false;
    }

    let payload: UtilsJwt.JwtPayload;
    try {
      payload = await UtilsJwt.verify(
        token,
        this.taonSessionProvider.cookies.REFRESH_TOKEN_SECRET,
      );
    } catch {
      if (opt.throwErrors) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.INVALID_REFRESH_TOKEN),
          code: HttpStatusEnum.INVALID_REFRESH_TOKEN,
          context: 'refresh verification',
          message: getStatusText(HttpStatusEnum.INVALID_REFRESH_TOKEN),
        });
      } else {
        this.debug && console.log('Invalid refrehs token');
      }
      return false;
    }
    if (typeof payload.rtId !== 'string' || !payload.rtId) {
      if (opt.throwErrors) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.INVALID_REFRESH_TOKEN),
          code: HttpStatusEnum.INVALID_REFRESH_TOKEN,
          context: 'refresh rotation',
          message: getStatusText(HttpStatusEnum.INVALID_REFRESH_TOKEN),
        });
      } else {
        this.debug && console.log('Not refrehs rotation');
      }
      return false;
    }

    const session = await this.taonSessionKvRepository.get(payload.rtId);

    if (!session) {
      if (opt.throwErrors) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.INVALID_REFRESH_TOKEN),
          code: HttpStatusEnum.INVALID_REFRESH_TOKEN,
          context: 'not sesion rtid',
          message: getStatusText(HttpStatusEnum.INVALID_REFRESH_TOKEN),
        });
      } else {
        this.debug && console.log('not sesion rtid');
      }
      return false;
    }

    if (session.expiresAt <= Date.now()) {
      await this.taonSessionKvRepository.delete(payload.rtId);
      if (opt.throwErrors) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.EXPIRED_REFRESH_TOKEN),
          code: HttpStatusEnum.EXPIRED_REFRESH_TOKEN,
          message: getStatusText(HttpStatusEnum.EXPIRED_REFRESH_TOKEN),
        });
      } else {
        this.debug && console.log('expired refresh');
      }
      return false;
    }

    if (session.sessionId !== undefined) {
      await this.touchSession(session.sessionId, session.userId, true);
    }

    // ROTATION (important)
    await this.taonSessionKvRepository.delete(payload.rtId);

    const newAccessToken = await this.taonSessionKvRepository.createAccessToken(
      session.userId,
      session.sessionId,
    );

    const newRefreshToken =
      await this.taonSessionKvRepository.createRefreshToken(
        session.userId,
        session.sessionId,
      );

    this.taonSessionKvRepository.setAuthCookies(
      res!,
      newAccessToken,
      newRefreshToken,
    );

    return true;
    //#endregion
  }
  //#endregion
}
