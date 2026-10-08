import {
  GET,
  Query,
  Models,
  Taon,
  TaonBaseCrudController,
  TaonController,
  TaonPaginationQuery,
  getStatusCode,
  HttpStatusEnum,
} from 'taon/src';
import { Brackets } from 'taon-typeorm/src';
import { Translation } from '@taon-dev/i18n/src';

import { TaonAuthContextRepository } from '../../taon-auth-context/taon-auth-context.repository';
import { TaonSessionUserIdentityRepository } from '../../taon-session-user/taon-session-user-identity.repository';
import { TaonSessionUserRepository } from '../../taon-session-user/taon-session-user.repository';
import { TaonSessionEntity } from '../taon-session.entity';
import { TaonSessionRepository } from '../taon-session.repository';

import { TaonSessionBackofficeModels } from './taon-session-backoffice.models';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@TaonController({
  className: 'TaonSessionBackofficeController',
  allowedMethods: ['paginationQuery', 'getBy'],
})
export class TaonSessionBackofficeController extends TaonBaseCrudController<
  TaonSessionBackofficeModels.SessionRow,
  {},
  TaonSessionBackofficeController
> {
  entityClassResolveFn = () => TaonSessionEntity;

  private readonly taonSessionRepository = this.injectCustomRepo(
    TaonSessionRepository,
  );

  private readonly taonAuthContextRepository = this.injectCustomRepo(
    TaonAuthContextRepository,
  );

  private readonly taonSessionUserRepository = this.injectCustomRepo(
    TaonSessionUserRepository,
  );

  private readonly taonSessionUserIdentityRepository = this.injectCustomRepo(
    TaonSessionUserIdentityRepository,
  );

  async beforeEachRequest({
    req,
    res,
  }: Models.TaonCtrlBeforeEachRequestParams<TaonSessionBackofficeController>): Promise<void> {
    //#region @websqlFunc
    await this.taonSessionRepository.throwIfNotAuthenticated({ req, res });
    const userId = Number('userId' in req ? req.userId : undefined);
    if (!Number.isSafeInteger(userId) || userId <= 0) {
      Taon.error({
        status: getStatusCode(HttpStatusEnum.FORBIDDEN),
        message: t.gettext('Only super users can view sessions'),
      });
    }
    const context = await this.taonAuthContextRepository.getContext(userId);
    if (!context.isSuperUser) {
      Taon.error({
        status: getStatusCode(HttpStatusEnum.FORBIDDEN),
        message: t.gettext('Only super users can view sessions'),
      });
    }
    //#endregion
  }

  protected async defaultPaginationQuery(
    query: TaonPaginationQuery<TaonSessionBackofficeController>,
  ): Promise<[TaonSessionBackofficeModels.SessionRow[], number]> {
    //#region @websqlFunc
    const columns = ['userId', 'deviceName', 'ip'];
    const pageNumber = Math.max(1, Math.floor(Number(query.pageNumber) || 1));
    const pageSize = Math.min(
      100,
      Math.max(1, Math.floor(Number(query.pageSize) || 10)),
    );
    const qb = this.db
      .createQueryBuilder('session')
      .select(['session.id', 'session.userId', 'session.deviceName', 'session.ip'])
      .where('session.revokedAt IS NULL')
      .andWhere('session.expiresAt > :now', { now: new Date() });

    if (query.search) {
      qb.andWhere(
        new Brackets(search => {
          columns.forEach((field, index) => {
            const sql = `CAST(session.${field} AS TEXT) LIKE :search`;
            const parameters = { search: `%${String(query.search)}%` };
            if (index === 0) {
              search.where(sql, parameters);
            } else {
              search.orWhere(sql, parameters);
            }
          });
        }),
      );
    }
    for (const field of columns) {
      const value = query.filters?.[field];
      if (value !== undefined && value !== null && value !== '') {
        qb.andWhere(`CAST(session.${field} AS TEXT) LIKE :filter_${field}`, {
          [`filter_${field}`]: `%${String(value)}%`,
        });
      }
    }
    const sort = query.sort;
    if (
      sort &&
      columns.includes(sort.field) &&
      (sort.direction === 'asc' || sort.direction === 'desc')
    ) {
      qb.orderBy(
        `session.${sort.field}`,
        sort.direction === 'desc' ? 'DESC' : 'ASC',
      ).addOrderBy('session.id', 'DESC');
    } else {
      qb.orderBy('session.id', 'DESC');
    }
    const [sessions, count] = await qb
      .skip((pageNumber - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return [
      sessions.map(session => ({
        id: session.id,
        userId: session.userId,
        deviceName: session.deviceName,
        ip: session.ip,
      })),
      count,
    ];
    //#endregion
  }

  @GET()
  getBy(
    @Query('id') id: number | string,
  ): Taon.Response<TaonSessionBackofficeModels.SessionDetails> {
    //#region @websqlFunc
    return async () => {
      const sessionId = Number(id);
      if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.BAD_REQUEST),
          message: t.gettext('Invalid session ID'),
        });
      }
      const session = await this.taonSessionRepository.findOne({
        select: {
          id: true,
          userId: true,
          identityId: true,
          authenticationProvider: true,
          deviceName: true,
          ip: true,
          userAgent: true,
          createdAt: true,
          lastActivityAt: true,
          expiresAt: true,
          revokedAt: true,
          revokeReason: true,
        },
        where: { id: sessionId },
      });
      if (!session) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.NOT_FOUND),
          message: t.gettext('Session not found'),
        });
      }
      const user = await this.taonSessionUserRepository.findOne({
        select: { id: true, username: true },
        where: { id: session.userId },
      });
      const identity = session.identityId
        ? await this.taonSessionUserIdentityRepository.findOne({
            select: { id: true, email: true, provider: true },
            where: { id: session.identityId, userId: session.userId },
          })
        : null;
      return {
        id: session.id,
        userId: session.userId,
        identityId: session.identityId,
        authenticationProvider: session.authenticationProvider,
        deviceName: session.deviceName,
        ip: session.ip,
        userAgent: session.userAgent,
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt,
        expiresAt: session.expiresAt,
        revokedAt: session.revokedAt,
        revokeReason: session.revokeReason,
        user: user ? { id: user.id, username: user.username } : null,
        identity: identity
          ? { id: identity.id, email: identity.email, provider: identity.provider }
          : null,
      };
    };
    //#endregion
  }
}
