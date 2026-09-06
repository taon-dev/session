//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonSessionUserIdentity } from './taon-session-user-identity.entity';
//#endregion

@TaonRepository({
  className: 'TaonSessionUserIdentityRepository',
})
export class TaonSessionUserIdentityRepository extends TaonBaseRepository<TaonSessionUserIdentity> {
  entityClassResolveFn: () => typeof TaonSessionUserIdentity = () => TaonSessionUserIdentity;

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