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
import { TaonSessionUserController } from '../taon-session-user/taon-session-user.controller';

import { TaonGroupEntity } from './taon-group.entity';
import { TaonGroupRepository } from './taon-group.repository';
//#endregion

@TaonController({
  className: 'TaonGroupController',
  allowedMethods: ['paginationQuery'],
})
export class TaonGroupController extends TaonBaseCrudController<
  TaonGroupEntity,
  {},
  TaonGroupController
> {
  entityClassResolveFn: () => typeof TaonGroupEntity = () => TaonGroupEntity;

  taonGroupRepository = this.injectCustomRepo(TaonGroupRepository);

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
