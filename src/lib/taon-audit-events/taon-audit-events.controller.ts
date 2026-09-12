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

import { TaonAuditEventsEntity } from './taon-audit-events.entity';
import { TaonAuditEventsRepository } from './taon-audit-events.repository';
//#endregion

@TaonController<TaonAuditEventsController>({
  className: 'TaonAuditEventsController',
  allowedMethods: [],
})
export class TaonAuditEventsController extends TaonBaseCrudController<TaonAuditEventsEntity> {
  entityClassResolveFn: () => typeof TaonAuditEventsEntity = () =>
    TaonAuditEventsEntity;

  taonAuditEventsRepository = this.injectCustomRepo(TaonAuditEventsRepository);

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
        await this.taonAuditEventsRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonAuditEventsController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}
