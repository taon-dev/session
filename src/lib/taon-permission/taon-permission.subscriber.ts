//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonPermissionEntity } from './taon-permission.entity';
import { TaonPermissionProvider } from './taon-permission.provider';
//#endregion

@TaonSubscriber<TaonPermissionSubscriber>({
  className: 'TaonPermissionSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonPermissionSubscriber extends TaonBaseSubscriberForEntity {
  taonPermissionProvider = this.injectProvider(TaonPermissionProvider);
  listenTo(): typeof TaonPermissionEntity {
    return TaonPermissionEntity;
  }
}
