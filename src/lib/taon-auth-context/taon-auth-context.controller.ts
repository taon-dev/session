//#region imports
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  GET,
  Query,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonAuthContext } from './taon-auth-context.entity';
import { TaonAuthContextRepository } from './taon-auth-context.repository';
//#endregion

@TaonController({
  className: 'TaonAuthContextController',
  allowedMethods: [],
})
export class TaonAuthContextController extends TaonBaseCrudController<TaonAuthContext> {
  entityClassResolveFn: () => typeof TaonAuthContext = () => TaonAuthContext;

  taonAuthContextRepository = this.injectCustomRepository(
    TaonAuthContextRepository,
  );

  //#region methods & getters / hello world
  @GET()
  helloWord(@Query('yourName') yourName: string): Taon.Response<string> {
    //#region @websqlFunc
    return async (req, res) => {
      const numOfEntities = await this.db.count();
      return (
        `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonAuthContextController)} ` +
        `controller..  ${numOfEntities} entites in db..`
      );
    };
    //#endregion
  }
  //#endregion
}
