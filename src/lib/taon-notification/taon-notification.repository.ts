//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonNotificationEntity } from './taon-notification.entity';
//#endregion

@TaonRepository({
  className: 'TaonNotificationRepository',
})
export class TaonNotificationRepository extends TaonBaseRepository<TaonNotificationEntity> {
  entityClassResolveFn: () => typeof TaonNotificationEntity = () => TaonNotificationEntity;

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