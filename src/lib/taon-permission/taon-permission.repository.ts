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
}
