//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonRole } from './taon-role.entity';
import { TaonRoleProvider } from './taon-role.provider';
//#endregion

@TaonSubscriber<TaonRoleSubscriber>({
  className: 'TaonRoleSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonRoleSubscriber extends TaonBaseSubscriberForEntity {
  taonRoleProvider = this.injectProvider(TaonRoleProvider);
  listenTo(): typeof TaonRole {
    return TaonRole;
  }
}