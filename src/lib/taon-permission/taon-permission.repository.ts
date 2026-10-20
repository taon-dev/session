//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonPermissionEntity } from './taon-permission.entity';
//#endregion

@TaonRepository({
  className: 'TaonPermissionRepository',
})
export class TaonPermissionRepository extends TaonBaseRepository<TaonPermissionEntity> {
  entityClassResolveFn: () => typeof TaonPermissionEntity = () =>
    TaonPermissionEntity;

  //#region methods / get permissions for user id
  async getPermissionsForUserId(
    userId: number | string,
  ): Promise<TaonPermissionEntity[]> {
    //#region @websqlFunc

    return await this.createQueryBuilder('permission')
      .distinct(true)

      // permission <- role
      .innerJoin(
        'TaonRolePermissionEntity',
        'rolePermission',
        'rolePermission.permissionId = permission.id',
      )

      // role directly assigned to user
      .leftJoin(
        'TaonSessionUserRoleEntity',
        'userRole',
        `
        userRole.roleId = rolePermission.roleId
        AND userRole.userId = :userId
      `,
        { userId },
      )

      // role inherited through user's group
      .leftJoin(
        'TaonGroupRoleEntity',
        'groupRole',
        'groupRole.roleId = rolePermission.roleId',
      )
      .leftJoin(
        'TaonSessionUserGroupEntity',
        'userGroup',
        `
        userGroup.groupId = groupRole.groupId
        AND userGroup.userId = :userId
      `,
        { userId },
      )

      .where(
        `
        userRole.id IS NOT NULL
        OR userGroup.id IS NOT NULL
      `,
      )

      .getMany();

    //#endregion
  }
  //#endregion

  //#region methods / update description
  async updateDescription(
    permissionId: number,
    description: string,
  ): Promise<TaonPermissionEntity> {
    //#region @websqlFunc

    const permission = await this.findOne({
      where: {
        id: permissionId as any,
      },
    });

    if (!permission) {
      return null;
    }

    permission.description = description;

    return await this.save(permission);

    //#endregion
  }
  //#endregion
}
