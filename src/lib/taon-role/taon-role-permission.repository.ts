//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonPermissionEntity } from '../taon-permission/taon-permission.entity';

import { TaonRolePermissionEntity } from './taon-role-permission.entity';
//#endregion

@TaonRepository({
  className: 'TaonRolePermissionRepository',
})
export class TaonRolePermissionRepository extends TaonBaseRepository<TaonRolePermissionEntity> {
  entityClassResolveFn: () => typeof TaonRolePermissionEntity = () => TaonRolePermissionEntity;

  /**
   * TODO remove this demo example method
   */
  async countEntitesWithEvenId(): Promise<number> {
    //#region @websqlFunc
    const result = await this.count({
      where: {
        id: Raw(alias => `${alias} % 2 = 0`),
      },
    });
    return result;
    //#endregion
  }

  async getPermissionsForRoleId(
    roleId: number,
  ): Promise<TaonPermissionEntity[]> {
    //#region @websqlFunc

    const rolePermissions = await this.find({
      where: {
        roleId,
      },
      relations: {
        permission: true,
      } as any,
    });

    return rolePermissions
      .map(rolePermission => rolePermission.permission)
      .filter(Boolean);

    //#endregion
  }

  async assignPermissionToRole(
    roleId: number,
    permissionId: number,
  ): Promise<TaonRolePermissionEntity> {
    //#region @websqlFunc

    const existing = await this.findOne({
      where: {
        roleId,
        permissionId,
      },
    });

    if (existing) {
      return existing;
    }

    const rolePermission = new TaonRolePermissionEntity().clone({
      roleId,
      permissionId,
    });

    return await this.save(rolePermission);

    //#endregion
  }

  async unassignPermissionFromRole(
    roleId: number,
    permissionId: number,
  ): Promise<void> {
    //#region @websqlFunc

    const existing = await this.findOne({
      where: {
        roleId,
        permissionId,
      },
    });

    if (!existing) {
      return;
    }

    await this.deleteById(existing.id);

    //#endregion
  }
}
