//#region imports
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  Query,
  GET,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonSessionUser } from './taon-session-user.entity';
import { TaonSessionUserRepository } from './taon-session-user.repository';
//#endregion

@TaonController<TaonSessionUserController>({
  className: 'TaonSessionUserController',
  allowedMethods: [
    // 'save/'
  ],
})
export class TaonSessionUserController extends TaonBaseCrudController<TaonSessionUser> {
  entityClassResolveFn: () => typeof TaonSessionUser = () => TaonSessionUser;

  taonSessionUserRepository = this.injectCustomRepo(TaonSessionUserRepository);
}
