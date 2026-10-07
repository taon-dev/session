//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';

import { TaonSessionUserGroupEntity } from './taon-session-user-group.entity';
//#endregion

@TaonRepository({
  className: 'TaonSessionUserGroupRepository',
})
export class TaonSessionUserGroupRepository extends TaonBaseRepository<TaonSessionUserGroupEntity> {
  entityClassResolveFn: () => typeof TaonSessionUserGroupEntity = () =>
    TaonSessionUserGroupEntity;

  async assignGroupToUser(
    userId: number,
    groupId: number,
  ): Promise<TaonSessionUserGroupEntity> {
    //#region @websqlFunc

    const existing = await this.findOne({
      where: {
        userId,
        groupId,
      },
    });

    if (existing) {
      return existing;
    }

    const userGroup = new TaonSessionUserGroupEntity().clone({
      userId,
      groupId,
    });

    return await this.save(userGroup);

    //#endregion
  }

  async unassignGroupFromUser(userId: number, groupId: number): Promise<void> {
    //#region @websqlFunc

    const existing = await this.findOne({
      where: {
        userId,
        groupId,
      },
    });

    if (!existing) {
      return;
    }

    await this.deleteById(existing.id);

    //#endregion
  }
}
