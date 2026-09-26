//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';

import { TaonSessionUserEntity } from './taon-session-user.entity';
//#endregion

@TaonRepository({
  className: 'TaonSessionUserRepository',
})
export class TaonSessionUserRepository extends TaonBaseRepository<TaonSessionUserEntity> {
  entityClassResolveFn: () => typeof TaonSessionUserEntity = () =>
    TaonSessionUserEntity;

  async createUser(): Promise<TaonSessionUserEntity> {
    //#region @websqlFunc

    const user = new TaonSessionUserEntity();

    return await this.save(user);

    //#endregion
  }

  async getUserById(
    userId: number | string,
  ): Promise<TaonSessionUserEntity | null> {
    //#region @websqlFunc

    return await this.findOne({
      where: {
        id: userId as any,
      },
    });

    //#endregion
  }
}
