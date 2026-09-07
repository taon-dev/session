//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonAuthContextEntity } from './taon-auth-context.entity';
import { TaonAuthContextProvider } from './taon-auth-context.provider';
//#endregion

@TaonSubscriber<TaonAuthContextSubscriber>({
  className: 'TaonAuthContextSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonAuthContextSubscriber extends TaonBaseSubscriberForEntity {
  taonAuthContextProvider = this.injectProvider(TaonAuthContextProvider);
  listenTo(): typeof TaonAuthContextEntity {
    return TaonAuthContextEntity;
  }
}
