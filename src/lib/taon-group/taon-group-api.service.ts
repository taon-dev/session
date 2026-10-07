import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonRoleEntity } from '../taon-role/taon-role.entity';

import { TaonGroupController } from './taon-group.controller';
import type { TaonGroupEntity } from './taon-group.entity';

@Injectable()
export class TaonGroupApiService extends TaonBaseAngularService {
  public taonGroupController = this.injectController(TaonGroupController);

  public get allMyEntities$(): Observable<TaonGroupEntity[]> {
    return this.taonGroupController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  //#region methods / all groups

  async getAllGroups(): Promise<TaonGroupEntity[]> {
    const response = await this.taonGroupController.getAll().request();

    return response.body?.json ?? [];
  }

  //#endregion

  //#region methods / user groups

  async getGroupsForUser(userId: number): Promise<TaonGroupEntity[]> {
    const response = await this.taonGroupController
      .getGroupsForUser(userId)
      .request();

    return response.body?.json ?? [];
  }

  async assignGroupToUser(userId: number, groupId: number): Promise<void> {
    await this.taonGroupController.assignGroupToUser(userId, groupId).request();
  }

  async unassignGroupFromUser(userId: number, groupId: number): Promise<void> {
    await this.taonGroupController
      .unassignGroupFromUser(userId, groupId)
      .request();
  }

  //#endregion

  //#region methods / group roles

  async getRolesForGroup(groupId: number): Promise<TaonRoleEntity[]> {
    const response = await this.taonGroupController
      .getRolesForGroup(groupId)
      .request();

    return response.body?.json ?? [];
  }

  async assignRoleToGroup(groupId: number, roleId: number): Promise<void> {
    await this.taonGroupController.assignRoleToGroup(groupId, roleId).request();
  }

  async unassignRoleFromGroup(groupId: number, roleId: number): Promise<void> {
    await this.taonGroupController
      .unassignRoleFromGroup(groupId, roleId)
      .request();
  }

  //#endregion
}
