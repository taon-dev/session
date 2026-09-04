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

import { TaonGroup } from './taon-group.entity';
import { TaonGroupRepository } from './taon-group.repository';
//#endregion

@TaonController({
  className: 'TaonGroupController',
})
export class TaonGroupController extends TaonBaseCrudController<TaonGroup> {
  entityClassResolveFn: () => typeof TaonGroup = () => TaonGroup;

  taonGroupRepository = this.injectCustomRepo(TaonGroupRepository);

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
        await this.taonGroupRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonGroupController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}