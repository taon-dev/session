//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonRoleEntity } from './taon-role.entity';
//#endregion

@TaonRepository({
  className: 'TaonRoleRepository',
})
export class TaonRoleRepository extends TaonBaseRepository<TaonRoleEntity> {
  entityClassResolveFn: () => typeof TaonRoleEntity = () => TaonRoleEntity;

  async getRolesForUserId(userId: number | string): Promise<TaonRoleEntity[]> {
    // TODO
    return [];
  }
}
