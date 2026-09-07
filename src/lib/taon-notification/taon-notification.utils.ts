import { TaonNotificationState } from './taon-notification.models';

export namespace TaonNotificationUtils {
  export function isActive(state: string): state is TaonNotificationState {
    return state === 'active';
  }
}