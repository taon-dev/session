//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonAuditEventsEntity } from './taon-audit-events.entity';
//#endregion

@TaonRepository({
  className: 'TaonAuditEventsRepository',
})
export class TaonAuditEventsRepository extends TaonBaseRepository<TaonAuditEventsEntity> {
  entityClassResolveFn: () => typeof TaonAuditEventsEntity = () => TaonAuditEventsEntity;

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