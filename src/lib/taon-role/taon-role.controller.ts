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

import { TaonRole } from './taon-role.entity';
import { TaonRoleRepository } from './taon-role.repository';
//#endregion

@TaonController({
  className: 'TaonRoleController',
})
export class TaonRoleController extends TaonBaseCrudController<TaonRole> {
  entityClassResolveFn: () => typeof TaonRole = () => TaonRole;

  taonRoleRepository = this.injectCustomRepo(TaonRoleRepository);

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
        await this.taonRoleRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonRoleController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}