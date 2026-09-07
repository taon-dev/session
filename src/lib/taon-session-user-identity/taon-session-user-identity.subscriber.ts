//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonSessionUserIdentityEntity } from './taon-session-user-identity.entity';
import { TaonSessionUserIdentityProvider } from './taon-session-user-identity.provider';
//#endregion

@TaonSubscriber<TaonSessionUserIdentitySubscriber>({
  className: 'TaonSessionUserIdentitySubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonSessionUserIdentitySubscriber extends TaonBaseSubscriberForEntity {
  taonSessionUserIdentityProvider = this.injectProvider(TaonSessionUserIdentityProvider);
  listenTo(): typeof TaonSessionUserIdentityEntity {
    return TaonSessionUserIdentityEntity;
  }
}
