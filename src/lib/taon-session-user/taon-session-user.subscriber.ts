//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';

import { TaonSessionUser } from './taon-session-user.entity';
import { TaonSessionUserProvider } from './taon-session-user.provider';
//#endregion

@TaonSubscriber<TaonSessionUserSubscriber>({
  className: 'TaonSessionUserSubscriber',
  allowedEvents: ['afterUpdate'],
})
export class TaonSessionUserSubscriber extends TaonBaseSubscriberForEntity {
  taonSessionUserProvider = this.injectProvider(TaonSessionUserProvider);

  listenTo(): typeof TaonSessionUser {
    return TaonSessionUser;
  }
}
