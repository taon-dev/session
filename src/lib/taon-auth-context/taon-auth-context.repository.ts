//#region imports
import { Taon, TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';
import { _ } from 'tnp-core/src';

import { TaonAuthContext } from './taon-auth-context.entity';
//#endregion

@TaonRepository({
  className: 'TaonAuthContextRepository',
})
export class TaonAuthContextRepository extends TaonBaseRepository<TaonAuthContext> {
  entityClassResolveFn: () => typeof TaonAuthContext = () => TaonAuthContext;

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