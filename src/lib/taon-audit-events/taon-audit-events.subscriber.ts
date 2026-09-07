//#region imports
import { TaonBaseSubscriberForEntity, TaonSubscriber } from 'taon/src';
import { TaonAuditEventsEntity } from './taon-audit-events.entity';
import { TaonAuditEventsProvider } from './taon-audit-events.provider';
//#endregion

@TaonSubscriber<TaonAuditEventsSubscriber>({
  className: 'TaonAuditEventsSubscriber',
  // allowedEvents: ['afterUpdate'],
})
export class TaonAuditEventsSubscriber extends TaonBaseSubscriberForEntity {
  taonAuditEventsProvider = this.injectProvider(TaonAuditEventsProvider);
  listenTo(): typeof TaonAuditEventsEntity {
    return TaonAuditEventsEntity;
  }
}