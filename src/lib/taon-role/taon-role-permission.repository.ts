//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

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
}