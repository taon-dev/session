//#region imports
import { Taon, TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';
import { _ } from 'tnp-core/src';

import { AnythingTestEntity } from './anything-test.entity';
//#endregion

@TaonRepository({
  className: 'AnythingTestRepository',
})
export class AnythingTestRepository extends TaonBaseRepository<AnythingTestEntity> {
  entityClassResolveFn: () => typeof AnythingTestEntity = () => AnythingTestEntity;

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
