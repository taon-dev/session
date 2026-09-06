//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonAuthContext } from './taon-auth-context.entity';
import { TaonAuthContextProvider } from './taon-auth-context.provider';
//#endregion

@TaonSubscriber<TaonAuthContextSubscriber>({
  className: 'TaonAuthContextSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonAuthContextSubscriber extends TaonBaseSubscriberForEntity {
  taonAuthContextProvider = this.injectProvider(TaonAuthContextProvider);
  listenTo(): typeof TaonAuthContext {
    return TaonAuthContext;
  }
}