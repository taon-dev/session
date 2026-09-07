import { TaonAuditEventsState } from './taon-audit-events.models';

export namespace TaonAuditEventsUtils {
  export function isActive(state: string): state is TaonAuditEventsState {
    return state === 'active';
  }
}