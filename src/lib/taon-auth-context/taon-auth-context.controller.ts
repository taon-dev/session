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

import { TaonAuthContextEntity } from './taon-auth-context.entity';
import { TaonAuthContextRepository } from './taon-auth-context.repository';
//#endregion

@TaonController({
  className: 'TaonAuthContextController',
  allowedMethods: [],
})
export class TaonAuthContextController extends TaonBaseCrudController<TaonAuthContextEntity> {
  entityClassResolveFn: () => typeof TaonAuthContextEntity = () =>
    TaonAuthContextEntity;

  private readonly taonAuthContextRepository = this.injectCustomRepo(TaonAuthContextRepository);
}
