//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonGroup } from './taon-group.entity';
//#endregion

@TaonRepository({
  className: 'TaonGroupRepository',
})
export class TaonGroupRepository extends TaonBaseRepository<TaonGroup> {
  entityClassResolveFn: () => typeof TaonGroup = () => TaonGroup;

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