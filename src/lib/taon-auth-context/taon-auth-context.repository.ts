//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonAuthContextEntity } from './taon-auth-context.entity';
//#endregion

@TaonRepository({
  className: 'TaonAuthContextRepository',
})
export class TaonAuthContextRepository extends TaonBaseRepository<TaonAuthContextEntity> {
  entityClassResolveFn: () => typeof TaonAuthContextEntity = () => TaonAuthContextEntity;

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
