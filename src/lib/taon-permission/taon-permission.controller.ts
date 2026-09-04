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

import { TaonPermission } from './taon-permission.entity';
import { TaonPermissionRepository } from './taon-permission.repository';
//#endregion

@TaonController({
  className: 'TaonPermissionController',
  allowedMethods: [],
})
export class TaonPermissionController extends TaonBaseCrudController<TaonPermission> {
  entityClassResolveFn: () => typeof TaonPermission = () => TaonPermission;

  taonPermissionRepository = this.injectCustomRepo(TaonPermissionRepository);

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
        await this.taonPermissionRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonPermissionController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}
