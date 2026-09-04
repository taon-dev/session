//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonRole } from './taon-role.entity';
//#endregion

@TaonRepository({
  className: 'TaonRoleRepository',
})
export class TaonRoleRepository extends TaonBaseRepository<TaonRole> {
  entityClassResolveFn: () => typeof TaonRole = () => TaonRole;

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