//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonPermissionEntity } from './taon-permission.entity';
//#endregion

@TaonRepository({
  className: 'TaonPermissionRepository',
})
export class TaonPermissionRepository extends TaonBaseRepository<TaonPermissionEntity> {
  entityClassResolveFn: () => typeof TaonPermissionEntity = () => TaonPermissionEntity;

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
