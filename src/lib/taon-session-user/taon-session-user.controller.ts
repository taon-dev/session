//#region imports
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  Query,
  GET,
  Models,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonSessionRepository } from '../taon-session/taon-session.repository';

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
