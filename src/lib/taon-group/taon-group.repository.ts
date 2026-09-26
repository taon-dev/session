//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonGroupEntity } from './taon-group.entity';
//#endregion

@TaonRepository({
  className: 'TaonGroupRepository',
})
export class TaonGroupRepository extends TaonBaseRepository<TaonGroupEntity> {
  entityClassResolveFn: () => typeof TaonGroupEntity = () => TaonGroupEntity;

  async getGroupsForUserId(
    userId: number | string,
  ): Promise<TaonGroupEntity[]> {
    // TODO
    return [];
  }
}
