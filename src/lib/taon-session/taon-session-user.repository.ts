//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonSessionUser } from './taon-session-user.entity';
//#endregion

@TaonRepository({
  className: 'TaonSessionUserRepository',
})
export class TaonSessionUserRepository extends TaonBaseRepository<TaonSessionUser> {
  entityClassResolveFn: () => typeof TaonSessionUser = () => TaonSessionUser;
}
