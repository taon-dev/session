//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonPermissionEntity } from './taon-permission.entity';
//#endregion

@TaonRepository({
  className: 'TaonPermissionRepository',
})
export class TaonPermissionRepository extends TaonBaseRepository<TaonPermissionEntity> {
  entityClassResolveFn: () => typeof TaonPermissionEntity = () => TaonPermissionEntity;

  async getPermissionsForUserId(
    userId: number | string,
  ): Promise<TaonPermissionEntity[]> {
    // TODO
    return [];
  }

  async updateDescription(
    permissionId: number,
    description: string,
  ): Promise<TaonPermissionEntity> {
    //#region @websqlFunc

    const permission = await this.findOne({
      where: {
        id: permissionId as any,
      },
    });

    if (!permission) {
      return null;
    }

    permission.description = description;

    return await this.save(permission);

    //#endregion
  }
}
