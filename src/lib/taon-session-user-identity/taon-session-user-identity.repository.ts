//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonSessionUserIdentityEntity } from './taon-session-user-identity.entity';
//#endregion

@TaonRepository({
  className: 'TaonSessionUserIdentityRepository',
})
export class TaonSessionUserIdentityRepository extends TaonBaseRepository<TaonSessionUserIdentityEntity> {
  entityClassResolveFn: () => typeof TaonSessionUserIdentityEntity = () => TaonSessionUserIdentityEntity;

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
