//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonRoleEntity } from '../taon-role/taon-role.entity';

import { TaonGroupRoleEntity } from './taon-group-role.entity';
//#endregion

@TaonRepository({
  className: 'TaonGroupRoleRepository',
})
export class TaonGroupRoleRepository extends TaonBaseRepository<TaonGroupRoleEntity> {
  entityClassResolveFn: () => typeof TaonGroupRoleEntity = () => TaonGroupRoleEntity;

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

  async getRolesForGroupId(groupId: number): Promise<TaonRoleEntity[]> {
    //#region @websqlFunc

    const groupRoles = await this.find({
      where: {
        groupId,
      },
      relations: {
        role: true,
      } as any,
    });

    return groupRoles.map(groupRole => groupRole.role).filter(Boolean);

    //#endregion
  }

  async assignRoleToGroup(
    groupId: number,
    roleId: number,
  ): Promise<TaonGroupRoleEntity> {
    //#region @websqlFunc

    const existing = await this.findOne({
      where: {
        groupId,
        roleId,
      },
    });

    if (existing) {
      return existing;
    }

    const groupRole = new TaonGroupRoleEntity().clone({
      groupId,
      roleId,
    });

    return await this.save(groupRole);

    //#endregion
  }

  async unassignRoleFromGroup(groupId: number, roleId: number): Promise<void> {
    //#region @websqlFunc

    const existing = await this.findOne({
      where: {
        groupId,
        roleId,
      },
    });

    if (!existing) {
      return;
    }

    await this.deleteById(existing.id);

    //#endregion
  }
}
