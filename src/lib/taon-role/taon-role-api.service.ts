import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonPermissionEntity } from '../taon-permission/taon-permission.entity';

import type { TaonRoleEntity } from './taon-role.entity';
import { TaonRoleController } from './taon-role.controller';

@Injectable()
export class TaonRoleApiService extends TaonBaseAngularService {
  public taonRoleController = this.injectController(TaonRoleController);

  public get allMyEntities$(): Observable<TaonRoleEntity[]> {
    return this.taonRoleController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  //#region methods / all roles

  async getAllRoles(): Promise<TaonRoleEntity[]> {
    const response = await this.taonRoleController.getAll().request();

    return response.body?.json ?? [];
  }

  //#endregion

  //#region methods / role permissions

  async getPermissionsForRole(roleId: number): Promise<TaonPermissionEntity[]> {
    const response = await this.taonRoleController
      .getPermissionsForRole(roleId)
      .request();

    return response.body?.json ?? [];
  }

  async assignPermissionToRole(
    roleId: number,
    permissionId: number,
  ): Promise<void> {
    await this.taonRoleController
      .assignPermissionToRole(roleId, permissionId)
      .request();
  }

  async unassignPermissionFromRole(
    roleId: number,
    permissionId: number,
  ): Promise<void> {
    await this.taonRoleController
      .unassignPermissionFromRole(roleId, permissionId)
      .request();
  }

  //#endregion
}
