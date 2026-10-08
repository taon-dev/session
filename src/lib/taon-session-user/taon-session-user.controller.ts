//#region imports
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  Query,
  GET,
  Models,
  TaonPaginationQuery,
} from 'taon/src';
import { Entity } from 'taon-typeorm/src';
import { _ } from 'tnp-core/src';

import { TaonSessionRepository } from '../taon-session/taon-session.repository';

import { TaonSessionUserIdentityEntity } from './taon-session-user-identity.entity';
import { TaonSessionUserEntity } from './taon-session-user.entity';
import { TaonSessionUserRepository } from './taon-session-user.repository';
//#endregion

@TaonController<TaonSessionUserController>({
  className: 'TaonSessionUserController',
  allowedMethods: ['paginationQuery', 'getBy'],
})
export class TaonSessionUserController extends TaonBaseCrudController<
  TaonSessionUserEntity,
  {},
  TaonSessionUserController
> {
  entityClassResolveFn: () => typeof TaonSessionUserEntity = () =>
    TaonSessionUserEntity;

  private readonly taonSessionRepository = this.injectCustomRepo(
    TaonSessionRepository,
  );

  async beforeEachRequest({
    req,
    res,
    methodConfig,
    classConfig,
  }: Models.TaonCtrlBeforeEachRequestParams<TaonSessionUserController>): Promise<void> {
    if (['paginationQuery', 'getBy'].includes(methodConfig.methodName)) {
      await this.taonSessionRepository.throwIfNotAuthenticated({
        req,
        res,
      });
    }
  }

  @GET()
  getBy(
    @Query('id') id: number | string,
  ): Models.Http.Response<TaonSessionUserEntity> {
    //#region @websqlFunc
    return async () =>
      this.injectCustomRepo(TaonSessionUserRepository).getUserById(id);
    //#endregion
  }

  protected paginationQueryMethods(): (keyof TaonSessionUserController)[] {
    return ['customPaginationQuery'] as any;
  }

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
}
