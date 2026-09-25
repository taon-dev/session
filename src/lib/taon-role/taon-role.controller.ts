//#region imports
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  Query,
  Models,
  GET,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonSessionRepository } from '../taon-session/taon-session.repository';
import { TaonSessionUserController } from '../taon-session-user/taon-session-user.controller';

import { TaonRoleEntity } from './taon-role.entity';
import { TaonRoleRepository } from './taon-role.repository';
//#endregion

@TaonController({
  className: 'TaonRoleController',
  allowedMethods: ['paginationQuery'],
})
export class TaonRoleController extends TaonBaseCrudController<TaonRoleEntity> {
  entityClassResolveFn: () => typeof TaonRoleEntity = () => TaonRoleEntity;

  taonRoleRepository = this.injectCustomRepo(TaonRoleRepository);

  private readonly taonSessionRepository = this.injectCustomRepo(
    TaonSessionRepository,
  );

  async beforeEachRequest({
    req,
    res,
    methodConfig,
  }: Models.TaonCtrlBeforeEachRequestParams<TaonSessionUserController>): Promise<void> {
    if (methodConfig.methodName === 'paginationQuery') {
      await this.taonSessionRepository.throwIfNotAuthenticated({
        req,
        res,
      });
    }
  }
}
