//#region imports
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  Query,
  GET,
  POST,
  DELETE,
  Body,
  Models,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonRoleEntity } from '../taon-role/taon-role.entity';
import { TaonSessionRepository } from '../taon-session/taon-session.repository';
import { TaonSessionUserGroupRepository } from '../taon-session-user/taon-session-user-group.repository';
import { TaonSessionUserController } from '../taon-session-user/taon-session-user.controller';

import { TaonGroupRoleRepository } from './taon-group-role.repository';
import { TaonGroupEntity } from './taon-group.entity';
import { TaonGroupRepository } from './taon-group.repository';
//#endregion

@TaonController({
  className: 'TaonGroupController',
  allowedMethods: [
    //#region allowed methods
    'paginationQuery',
    'getAll',
    'getGroupsForUser',
    'assignGroupToUser',
    'unassignGroupFromUser',
    'getRolesForGroup',
    'assignRoleToGroup',
    'unassignRoleFromGroup',
    //#endregion
  ],
})
export class TaonGroupController extends TaonBaseCrudController<
  TaonGroupEntity,
  {},
  TaonGroupController
> {
  entityClassResolveFn: () => typeof TaonGroupEntity = () => TaonGroupEntity;

  taonGroupRepository = this.injectCustomRepo(TaonGroupRepository);

  private readonly taonGroupRoleRepository = this.injectCustomRepo(
    TaonGroupRoleRepository,
  );

  private readonly taonSessionUserGroupRepository = this.injectCustomRepo(
    TaonSessionUserGroupRepository,
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

  //#region methods & getters / groups assigned to user
  @GET()
  getGroupsForUser(
    @Query('userId') userId: number,
  ): Taon.Response<TaonGroupEntity[]> {
    //#region @websqlFunc
    return async () => {
      return await this.taonGroupRepository.getGroupsForUserId(Number(userId));
    };
    //#endregion
  }
  //#endregion

  //#region methods & getters / assign group to user
  @POST()
  assignGroupToUser(
    @Body('userId') userId: number,
    @Body('groupId') groupId: number,
  ): Taon.Response<void> {
    //#region @websqlFunc
    return async () => {
      await this.taonSessionUserGroupRepository.assignGroupToUser(
        Number(userId),
        Number(groupId),
      );
    };
    //#endregion
  }
  //#endregion

  //#region methods & getters / unassign group from user
  @DELETE()
  unassignGroupFromUser(
    @Query('userId') userId: number,
    @Query('groupId') groupId: number,
  ): Taon.Response<void> {
    //#region @websqlFunc
    return async () => {
      await this.taonSessionUserGroupRepository.unassignGroupFromUser(
        Number(userId),
        Number(groupId),
      );
    };
    //#endregion
  }
  //#endregion

  //#region methods & getters / roles assigned to group
  @GET()
  getRolesForGroup(
    @Query('groupId') groupId: number,
  ): Taon.Response<TaonRoleEntity[]> {
    //#region @websqlFunc
    return async () => {
      return await this.taonGroupRoleRepository.getRolesForGroupId(
        Number(groupId),
      );
    };
    //#endregion
  }
  //#endregion

  //#region methods & getters / assign role to group
  @POST()
  assignRoleToGroup(
    @Body('groupId') groupId: number,
    @Body('roleId') roleId: number,
  ): Taon.Response<void> {
    //#region @websqlFunc
    return async () => {
      await this.taonGroupRoleRepository.assignRoleToGroup(
        Number(groupId),
        Number(roleId),
      );
    };
    //#endregion
  }
  //#endregion

  //#region methods & getters / unassign role from group
  @DELETE()
  unassignRoleFromGroup(
    @Query('groupId') groupId: number,
    @Query('roleId') roleId: number,
  ): Taon.Response<void> {
    //#region @websqlFunc
    return async () => {
      await this.taonGroupRoleRepository.unassignRoleFromGroup(
        Number(groupId),
        Number(roleId),
      );
    };
    //#endregion
  }
  //#endregion
}
