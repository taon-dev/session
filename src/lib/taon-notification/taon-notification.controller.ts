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

import { TaonNotificationEntity } from './taon-notification.entity';
import { TaonNotificationRepository } from './taon-notification.repository';
//#endregion

@TaonController<TaonNotificationController>({
  className: 'TaonNotificationController',
  allowedMethods: [],
})
export class TaonNotificationController extends TaonBaseCrudController<TaonNotificationEntity> {
  entityClassResolveFn: () => typeof TaonNotificationEntity = () =>
    TaonNotificationEntity;

  taonNotificationRepository = this.injectCustomRepo(
    TaonNotificationRepository,
  );

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
        await this.taonNotificationRepository.countEntitesWithEvenId();
      return `Hello ${yourName || 'world'} from ${ClassHelpers.getName(TaonNotificationController)}
      controller..  ${numOfEntities} entites in db..
      ${numberOfEvenEntities} entites with even ids (2,4,6,8 etc.)
      `;
    };
    //#endregion
  }
  //#endregion
}
