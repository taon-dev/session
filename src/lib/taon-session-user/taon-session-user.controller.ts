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

import { TaonSessionUserEntity } from './taon-session-user.entity';
import { TaonSessionUserRepository } from './taon-session-user.repository';
//#endregion

@TaonController<TaonSessionUserController>({
  className: 'TaonSessionUserController',
  allowedMethods: ['paginationQuery'],
})
export class TaonSessionUserController extends TaonBaseCrudController<TaonSessionUserEntity> {
  entityClassResolveFn: () => typeof TaonSessionUserEntity = () =>
    TaonSessionUserEntity;

  taonSessionUserRepository = this.injectCustomRepo(TaonSessionUserRepository);
}
