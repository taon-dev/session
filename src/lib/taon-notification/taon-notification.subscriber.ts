//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonNotificationEntity } from './taon-notification.entity';
import { TaonNotificationProvider } from './taon-notification.provider';
//#endregion

@TaonSubscriber<TaonNotificationSubscriber>({
  className: 'TaonNotificationSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonNotificationSubscriber extends TaonBaseSubscriberForEntity {
  taonNotificationProvider = this.injectProvider(TaonNotificationProvider);
  listenTo(): typeof TaonNotificationEntity {
    return TaonNotificationEntity;
  }
}