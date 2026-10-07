//#region imports
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  Query,
  Models,
  GET,
  POST,
  DELETE,
  Body,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonPermissionEntity } from '../taon-permission/taon-permission.entity';
import { TaonSessionRepository } from '../taon-session/taon-session.repository';
import { TaonSessionUserController } from '../taon-session-user/taon-session-user.controller';

import { TaonRolePermissionRepository } from './taon-role-permission.repository';
import { TaonRoleEntity } from './taon-role.entity';
import { TaonRoleRepository } from './taon-role.repository';
//#endregion

@TaonController({
  className: 'TaonRoleController',
  allowedMethods: [
    //#region allowed methods
    'paginationQuery',
    'getAll',
    'getPermissionsForRole',
    'assignPermissionToRole',
    'unassignPermissionFromRole',
    //#endregion
  ],
})
export class TaonRoleController extends TaonBaseCrudController<TaonRoleEntity> {
  entityClassResolveFn: () => typeof TaonRoleEntity = () => TaonRoleEntity;

  taonRoleRepository = this.injectCustomRepo(TaonRoleRepository);

  private readonly taonRolePermissionRepository = this.injectCustomRepo(
    TaonRolePermissionRepository,
  );

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

  //#region methods & getters / permissions assigned to role
  @GET()
  getPermissionsForRole(
    @Query('roleId') roleId: number,
  ): Taon.Response<TaonPermissionEntity[]> {
    //#region @websqlFunc
    return async () => {
      return await this.taonRolePermissionRepository.getPermissionsForRoleId(
        Number(roleId),
      );
    };
    //#endregion
  }
  //#endregion

  //#region methods & getters / assign permission to role
  @POST()
  assignPermissionToRole(
    @Body('roleId') roleId: number,
    @Body('permissionId') permissionId: number,
  ): Taon.Response<void> {
    //#region @websqlFunc
    return async () => {
      await this.taonRolePermissionRepository.assignPermissionToRole(
        Number(roleId),
        Number(permissionId),
      );
    };
    //#endregion
  }
  //#endregion

  //#region methods & getters / unassign permission from role
  @DELETE()
  unassignPermissionFromRole(
    @Query('roleId') roleId: number,
    @Query('permissionId') permissionId: number,
  ): Taon.Response<void> {
    //#region @websqlFunc
    return async () => {
      await this.taonRolePermissionRepository.unassignPermissionFromRole(
        Number(roleId),
        Number(permissionId),
      );
    };
    //#endregion
  }
  //#endregion
}
