//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonRoleEntity } from './taon-role.entity';
//#endregion

@TaonRepository({
  className: 'TaonRoleRepository',
})
export class TaonRoleRepository extends TaonBaseRepository<TaonRoleEntity> {
  entityClassResolveFn: () => typeof TaonRoleEntity = () => TaonRoleEntity;

  async getRolesForUserId(userId: number | string): Promise<TaonRoleEntity[]> {
    //#region @websqlFunc

    return await this.createQueryBuilder('role')
      .distinct(true)

      // direct user -> role
      .leftJoin(
        'TaonSessionUserRoleEntity',
        'userRole',
        'userRole.roleId = role.id AND userRole.userId = :userId',
        { userId },
      )

      // user -> group -> role
      .leftJoin(
        'TaonGroupRoleEntity',
        'groupRole',
        'groupRole.roleId = role.id',
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
}
