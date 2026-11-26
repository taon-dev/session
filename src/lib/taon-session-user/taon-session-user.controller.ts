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
  PUT,
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
import { TaonSessionUserIdentityRepository } from './taon-session-user-identity.repository';
import { TaonSessionIdentityProvider } from './taon-session-user.models';
import {
  TaonSessionCoreAuthorization,
  TaonSessionCorePermissions,
  TaonSessionCoreRoles,
} from '../index';

//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export interface TaonSessionOwnProfileUpdate {
  firstName?: string | null;
  lastName?: string | null;
  telephone?: string | null;
  email?: string;
  currentPassword?: string;
}

export interface TaonSessionUserProfileDto {
  id: number;
  firstName: string | null;
  lastName: string | null;
  telephone: string | null;
  email: string | null;
}

export interface TaonSessionUserAccountStatusUpdate {
  status: 'active' | 'inactive' | 'temporary';
  days?: number;
}

@TaonController<TaonSessionUserController>({
  className: 'TaonSessionUserController',
  allowedMethods: ['paginationQuery', 'getBy', 'setAccountStatus', 'ownProfile', 'updateOwnProfile', 'profile', 'administrators'],
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
      ['paginationQuery', 'getBy', 'setAccountStatus', 'ownProfile', 'updateOwnProfile', 'profile', 'administrators'].includes(
        methodConfig.methodName,
      )
    ) {
      await this.taonSessionRepository.throwIfNotAuthenticated({
        req,
        res,
      });

      if (['ownProfile', 'updateOwnProfile', 'profile', 'administrators'].includes(methodConfig.methodName)) {
        return;
      }

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

  //#region methods / profile
  @GET()
  ownProfile(): Models.Http.Response<TaonSessionUserProfileDto> {
    //#region @websqlFunc
    return async req => {
      const user = await this.inject(TaonSessionUserRepository).getUserById(req.userId);
      if (!user) Taon.error({ status: getStatusCode(HttpStatusEnum.NOT_FOUND), message: 'User not found.' });
      const emailIdentity = (user.identities || []).find(identity => identity.provider === TaonSessionIdentityProvider.PASSWORD) || user.identities?.[0];
      return {
        id: user.id,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        telephone: user.telephone || null,
        email: emailIdentity?.email || null,
      } as any;
    };
    //#endregion
  }

  @GET()
  profile(@Query('id') id: number): Models.Http.Response<TaonSessionUserProfileDto> {
    //#region @websqlFunc
    return async req => {
      const current = await this.inject(TaonSessionUserRepository).getUserById(req.userId);
      const context = await this.taonAuthContextRepository.getContext(req.userId, req.sessionId);
      if (Number(id) !== Number(req.userId) && !context?.isSuperUser && !context?.hasAccess?.toManageUsers && !context?.hasAccess?.toManageCms) {
        Taon.error({ status: getStatusCode(HttpStatusEnum.FORBIDDEN), message: 'Profile access denied.' });
      }
      const user = await this.inject(TaonSessionUserRepository).getUserById(id);
      if (!user) Taon.error({ status: getStatusCode(HttpStatusEnum.NOT_FOUND), message: 'User not found.' });
      const emailIdentity = (user.identities || []).find(identity => identity.provider === TaonSessionIdentityProvider.PASSWORD) || user.identities?.[0];
      return {
        id: user.id,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        telephone: context?.isSuperUser || context?.hasAccess?.toManageCms ? user.telephone || null : null,
        email: emailIdentity?.email || null,
      } as any;
    };
    //#endregion
  }

  @PUT()
  updateOwnProfile(@Body() input: TaonSessionOwnProfileUpdate): Models.Http.Response<TaonSessionUserProfileDto> {
    //#region @websqlFunc
    return async req => {
      const userRepo = this.inject(TaonSessionUserRepository);
      const identityRepo = this.inject(TaonSessionUserIdentityRepository);
      const user = await userRepo.getUserById(req.userId);
      if (!user) Taon.error({ status: getStatusCode(HttpStatusEnum.NOT_FOUND), message: 'User not found.' });

      if (input.firstName !== undefined) user.firstName = input.firstName?.trim() || null;
      if (input.lastName !== undefined) user.lastName = input.lastName?.trim() || null;
      if (input.telephone !== undefined) user.telephone = input.telephone?.trim() || null;
      await userRepo.save(user);

      if (input.email !== undefined) {
        const normalizedEmail = input.email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
          Taon.error({ status: getStatusCode(HttpStatusEnum.BAD_REQUEST), message: 'A valid email address is required.' });
        }
        const identities = user.identities || [];
        const passwordIdentity = identities.find(identity => identity.provider === TaonSessionIdentityProvider.PASSWORD);
        const currentEmail = passwordIdentity?.email || passwordIdentity?.providerUserId;
        if (currentEmail && normalizedEmail !== currentEmail.toLowerCase()) {
          if (!input.currentPassword) {
            Taon.error({ status: getStatusCode(HttpStatusEnum.BAD_REQUEST), message: 'Your current password is required to change email.' });
          }
          const verified = await identityRepo.verifyPassword(currentEmail, input.currentPassword);
          if (!verified) {
            Taon.error({ status: getStatusCode(HttpStatusEnum.UNAUTHORIZED), message: 'Invalid current password.' });
          }
          const existing = await identityRepo.findPasswordIdentity(normalizedEmail);
          if (existing && existing.userId !== user.id) {
            Taon.error({ status: getStatusCode(HttpStatusEnum.CONFLICT), message: 'Email address is already in use.' });
          }
          passwordIdentity!.providerUserId = normalizedEmail;
          passwordIdentity!.email = normalizedEmail;
          passwordIdentity!.isEmailVerified = false;
          await identityRepo.save(passwordIdentity!);
        }
      }

      const updated = await userRepo.getUserById(user.id);
      const emailIdentity = (updated?.identities || []).find(identity => identity.provider === TaonSessionIdentityProvider.PASSWORD) || updated?.identities?.[0];
      return {
        id: updated!.id,
        firstName: updated!.firstName || null,
        lastName: updated!.lastName || null,
        telephone: updated!.telephone || null,
        email: emailIdentity?.email || null,
      } as any;
    };
    //#endregion
  }

  @GET()
  administrators(): Models.Http.Response<TaonSessionUserProfileDto[]> {
    //#region @websqlFunc
    return async req => {
      const context = await this.taonAuthContextRepository.getContext(req.userId, req.sessionId);
      if (!context?.isSuperUser) Taon.error({ status: getStatusCode(HttpStatusEnum.FORBIDDEN), message: 'Only superusers can list administrators.' });
      const users = await this.db.find({ relations: { identities: true } });
      const result: TaonSessionUserProfileDto[] = [];
      for (const user of users) {
        const userContext = await this.taonAuthContextRepository.getContext(user.id, req.sessionId);
        if (!userContext?.isSuperUser && !userContext?.hasAccess?.toManageCms && !userContext?.hasAccess?.toManageUsers) continue;
        const emailIdentity = (user.identities || []).find(identity => identity.provider === TaonSessionIdentityProvider.PASSWORD) || user.identities?.[0];
        result.push({ id: user.id, firstName: user.firstName || null, lastName: user.lastName || null, telephone: user.telephone || null, email: emailIdentity?.email || null });
      }
      return result as any;
    };
    //#endregion
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
