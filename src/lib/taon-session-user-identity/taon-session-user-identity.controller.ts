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

import { TaonSessionUserIdentity } from './taon-session-user-identity.entity';
import { TaonSessionUserIdentityRepository } from './taon-session-user-identity.repository';
//#endregion

@TaonController({
  className: 'TaonSessionUserIdentityController',
})
export class TaonSessionUserIdentityController extends TaonBaseCrudController<TaonSessionUserIdentity> {
  entityClassResolveFn: () => typeof TaonSessionUserIdentity = () => TaonSessionUserIdentity;

  taonSessionUserIdentityRepository = this.injectCustomRepo(TaonSessionUserIdentityRepository);

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
        await this.taonSessionUserIdentityRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonSessionUserIdentityController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}