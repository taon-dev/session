//#region imports
import {
  TaonBaseRepository,
  TaonBaseKvRepository,
  TaonRepository,
} from 'taon/src';

import { TaonProfileEntity } from './taon-profile.entity';
//#endregion

@TaonRepository({
  className: 'TaonProfileKvRepository',
})
export class TaonProfileKvRepository extends TaonBaseKvRepository<{
  usersToNotify: TaonProfileEntity[];
}> {
  async notifyUsers(users: TaonProfileEntity[]) {
    this.set('usersToNotify', users);
  }
}