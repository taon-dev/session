//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonRoleEntity } from './taon-role.entity';
import { TaonRoleProvider } from './taon-role.provider';
//#endregion

@TaonSubscriber<TaonRoleSubscriber>({
  className: 'TaonRoleSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonRoleSubscriber extends TaonBaseSubscriberForEntity {
  taonRoleProvider = this.injectProvider(TaonRoleProvider);
  listenTo(): typeof TaonRoleEntity {
    return TaonRoleEntity;
  }
}
