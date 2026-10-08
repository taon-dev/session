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
  //#region fields & getters
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
        message: getStatusText(HttpStatusEnum.INVALID_TOKEN),
        status: getStatusCode(HttpStatusEnum.INVALID_TOKEN),
      });
    }
    return session;
    //#endregion
  }

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

  //#region get session by id
  async getSessionBy(userId: number | string): Promise<TaonSessionEntity> {
    // TODO not only id ?
    // let session = new TaonSessionEntity().clone(partialSessino);
    // session = await this.save(session);
    return null;
  }
  //#endregion

  //#region throw if not authroized
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
        message: getStatusText(HttpStatusEnum.INVALID_TOKEN),
        status: getStatusCode(HttpStatusEnum.INVALID_TOKEN),
      });
      return;
    }
    if (
      typeof payload.userId !== 'number' ||
      !Number.isSafeInteger(payload.userId) ||
      payload.userId <= 0
    ) {
      Taon.error({
        context: 'throwIfNotAuthenticated',
        message: getStatusText(HttpStatusEnum.INVALID_TOKEN),
        status: getStatusCode(HttpStatusEnum.INVALID_TOKEN),
      });
      return;
    }
    if (payload.sessionId !== undefined) {
      if (
        typeof payload.sessionId !== 'number' ||
        !Number.isSafeInteger(payload.sessionId) ||
        payload.sessionId <= 0
      ) {
        Taon.error({
          context: 'throwIfNotAuthenticated',
          message: getStatusText(HttpStatusEnum.INVALID_TOKEN),
          status: getStatusCode(HttpStatusEnum.INVALID_TOKEN),
        });
        return;
      }
      await this.touchSession(payload.sessionId, payload.userId);
    }
    Object.assign(req, { userId: payload.userId });
    next();
    //#endregion
  }
  //#endregion
}
