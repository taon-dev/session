//#region imports
import { TaonSessionUserController } from '../taon-session-user/taon-session-user.controller';
import { TaonSessionRepository } from '../taon-session/taon-session.repository';
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


import { TaonPermissionEntity } from './taon-permission.entity';
import { TaonPermissionRepository } from './taon-permission.repository';
//#endregion

@TaonController({
  className: 'TaonPermissionController',
  allowedMethods: ['paginationQuery'],
})
export class TaonPermissionController extends TaonBaseCrudController<TaonPermissionEntity> {
  entityClassResolveFn: () => typeof TaonPermissionEntity = () =>
    TaonPermissionEntity;

  taonPermissionRepository = this.injectCustomRepo(TaonPermissionRepository);

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
