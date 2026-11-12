//#region imports
import { TaonSessionUserProvider } from '../taon-session-user/taon-session-user.provider';
import { Translation } from '@taon-dev/i18n/src';
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  Query,
  GET,
  POST,
  Body,
  Models,
  TaonPaginationQuery,
  getStatusCode,
  HttpStatusEnum,
} from 'taon/src';
import { Entity } from 'taon-typeorm/src';
import { _ } from 'tnp-core/src';

import { TaonAuthContextRepository } from '../taon-auth-context/taon-auth-context.repository';
import { TaonSessionRepository } from '../taon-session/taon-session.repository';

import { TaonSessionUserIdentityEntity } from './taon-session-user-identity.entity';
import { TaonSessionUserEntity } from './taon-session-user.entity';
import { TaonSessionUserRepository } from './taon-session-user.repository';
import {
  TaonSessionCoreAuthorization,
  TaonSessionCorePermissions,
  TaonSessionCoreRoles,
} from '../index';

//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export interface TaonSessionUserAccountStatusUpdate {
  status: 'active' | 'inactive' | 'temporary';
  days?: number;
}

@TaonController<TaonSessionUserController>({
  className: 'TaonSessionUserController',
  allowedMethods: ['paginationQuery', 'getBy', 'setAccountStatus'],
})
export class TaonSessionUserController extends TaonBaseCrudController<
  TaonSessionUserEntity,
  {},
  TaonSessionUserController
> {
  //#region fields & getters
  entityClassResolveFn: () => typeof TaonSessionUserEntity = () =>
    TaonSessionUserEntity;

  protected readonly taonSessionRepository = this.inject(
    TaonSessionRepository,
  );

  protected readonly taonAuthContextRepository = this.inject(
    TaonAuthContextRepository,
  );

  //#endregion

  //#region methods / before each request
  async beforeEachRequest({
    req,
    res,
    methodConfig,
    classConfig,
  }: Models.TaonCtrlBeforeEachRequestParams<TaonSessionUserController>): Promise<void> {
    if (
      ['paginationQuery', 'getBy', 'setAccountStatus'].includes(
        methodConfig.methodName,
      )
    ) {
      await this.taonSessionRepository.throwIfNotAuthenticated({
        req,
        res,
      });

      const context = await this.taonAuthContextRepository.getContext(
        req.userId,
        req.sessionId,
      );

      if (!context || !context.hasAccess.toManageUsers) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.FORBIDDEN),
          message: t.gettext('You are not authorized to manage users'),
        });
      }
    }
  }
  //#endregion

  //#region methods / get by
  @GET()
  getBy(
    @Query('id') id: number | string,
  ): Models.Http.Response<TaonSessionUserEntity> {
    //#region @websqlFunc
    return async () =>
      this.inject(TaonSessionUserRepository).getUserById(id);
    //#endregion
  }
  //#endregion

  @POST()
  setAccountStatus(
    @Query('id') id: number,
    @Body() update: TaonSessionUserAccountStatusUpdate,
  ): Models.Http.Response<TaonSessionUserEntity> {
    //#region @websqlFunc
    return async (_req, _res, { t }) => {
      if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.BAD_REQUEST),
          message: t.gettext('A valid user ID is required.'),
        });
      }

      const user = await this.db.findOne({ where: { id } });
      if (!user) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.NOT_FOUND),
          message: t.gettext('User not found.'),
        });
      }

      if (update?.status === 'active') {
        user.isActive = true;
        user.inactiveUntil = null;
      } else if (update?.status === 'inactive') {
        user.isActive = false;
        user.inactiveUntil = null;
      } else if (
        update?.status === 'temporary' &&
        Number.isSafeInteger(update.days) &&
        update.days! > 0
      ) {
        user.isActive = false;
        user.inactiveUntil = new Date(
          Date.now() + update.days! * 24 * 60 * 60 * 1000,
        );
      } else {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.BAD_REQUEST),
          message: t.gettext('Choose a valid account status and duration.'),
        });
      }

      if (
        update?.status === 'temporary' &&
        !Number.isFinite(user.inactiveUntil?.getTime())
      ) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.BAD_REQUEST),
          message: t.gettext('The temporary inactivity duration is invalid.'),
        });
      }

      return this.db.save(user);
    };
    //#endregion
  }

  //#region methods / pagination query methods
  protected paginationQueryMethods(): (keyof TaonSessionUserController)[] {
    return ['customPaginationQuery'] as any;
  }
  //#endregion

  //#region methods / pagination query
  @GET()
  paginationQuery(
    queryJson?: TaonPaginationQuery<any>,
  ): Models.Http.Response<TaonSessionUserEntity[]> {
    return async (req, res) => {
      queryJson.callQueryMethod = 'customPaginationQuery';
      const data = await super.paginationQuery(queryJson)(req, res);
      return data;
    };
  }
  //#endregion

  //#region methods / custom pagination query
  protected async customPaginationQuery(
    query: TaonPaginationQuery<TaonSessionUserController>,
  ): Promise<[TaonSessionUserEntity[], number]> {
    //#region @websqlFunc
    const pageNumber = query.pageNumber ?? 1;
    const pageSize = query.pageSize ?? 10;

    const tags = {
      user: 'user',
      identity: 'identity',
    };

    const qb = this.db
      .createQueryBuilder(tags.user)
      .leftJoinAndSelect(
        `${tags.user}.${'identities' as keyof TaonSessionUserEntity}`,
        tags.identity,
      );

    //#region search

    if (query.search) {
      const search = `%${query.search.toLowerCase()}%`;

      qb.andWhere(
        `(
        LOWER(${tags.identity}.${'email' as keyof TaonSessionUserIdentityEntity}) LIKE :search
        OR LOWER(${tags.identity}.${'provider' as keyof TaonSessionUserIdentityEntity}) LIKE :search
        OR CAST(${tags.user}.${'id' as keyof TaonSessionUserEntity} AS TEXT) LIKE :search
      )`,
        { search },
      );
    }

    //#endregion

    //#region pagination

    qb.skip((pageNumber - 1) * pageSize);
    qb.take(pageSize);

    //#endregion

    const [users, total] = await qb.getManyAndCount();

    return [users, total];
    //#endregion
  }
  //#endregion
}
