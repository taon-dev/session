//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonSessionUserEntity } from './taon-session-user.entity';
//#endregion

@TaonRepository({
  className: 'TaonSessionUserRepository',
})
export class TaonSessionUserRepository extends TaonBaseRepository<TaonSessionUserEntity> {
  entityClassResolveFn: () => typeof TaonSessionUserEntity = () => TaonSessionUserEntity;
}
