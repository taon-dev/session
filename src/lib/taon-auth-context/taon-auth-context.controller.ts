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

import { TaonAuthContext } from './taon-auth-context.entity';
import { TaonAuthContextRepository } from './taon-auth-context.repository';
//#endregion

@TaonController({
  className: 'TaonAuthContextController',
})
export class TaonAuthContextController extends TaonBaseCrudController<TaonAuthContext> {
  entityClassResolveFn: () => typeof TaonAuthContext = () => TaonAuthContext;

  taonAuthContextRepository = this.injectCustomRepo(TaonAuthContextRepository);

  //#region methods & getters / hello world
  /**
   * TODO remove this demo example method
   */
  @GET()
  helloWord(@Query('yourName') yourName: string): Taon.Response<string> {
    //#region @websqlFunc
    return async (req, res) => {
      const numOfEntities = await this.db.count();
      const numberOfEvenEntities =
        await this.taonAuthContextRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonAuthContextController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}