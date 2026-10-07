//#region imports
import { TaonSessionUserController } from '../taon-session-user/taon-session-user.controller';
import { TaonSessionRepository } from '../taon-session/taon-session.repository';
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  Query,
  GET,
  PUT,
  Body,
  Models,
} from 'taon/src';
import { _ } from 'tnp-core/src';


import { TaonPermissionEntity } from './taon-permission.entity';
import { TaonPermissionRepository } from './taon-permission.repository';
//#endregion

@TaonController({
  className: 'TaonPermissionController',
  allowedMethods: [
    //#region allowed methods
    'paginationQuery',
    'getAll',
    'updateDescription',
    //#endregion
  ],
})
export class TaonPermissionController extends TaonBaseCrudController<TaonPermissionEntity> {
  entityClassResolveFn: () => typeof TaonPermissionEntity = () =>
    TaonPermissionEntity;

  taonPermissionRepository = this.injectCustomRepo(TaonPermissionRepository);

  private readonly taonSessionRepository = this.injectCustomRepo(
    TaonSessionRepository,
  );

  async beforeEachRequest({
    req,
    res,
    methodConfig,
  }: Models.TaonCtrlBeforeEachRequestParams<TaonSessionUserController>): Promise<void> {
    await this.taonSessionRepository.throwIfNotAuthenticated({
      req,
      res,
    });
  }

  //#region methods & getters / update description
  @PUT()
  updateDescription(
    @Body('permissionId') permissionId: number,
    @Body('description') description: string,
  ): Taon.Response<TaonPermissionEntity> {
    //#region @websqlFunc
    return async () => {
      return await this.taonPermissionRepository.updateDescription(
        Number(permissionId),
        description,
      );
    };
    //#endregion
  }
  //#endregion
}
