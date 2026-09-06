//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonSessionUserIdentity } from './taon-session-user-identity.entity';
import { TaonSessionUserIdentityProvider } from './taon-session-user-identity.provider';
//#endregion

@TaonSubscriber<TaonSessionUserIdentitySubscriber>({
  className: 'TaonSessionUserIdentitySubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonSessionUserIdentitySubscriber extends TaonBaseSubscriberForEntity {
  taonSessionUserIdentityProvider = this.injectProvider(TaonSessionUserIdentityProvider);
  listenTo(): typeof TaonSessionUserIdentity {
    return TaonSessionUserIdentity;
  }
}