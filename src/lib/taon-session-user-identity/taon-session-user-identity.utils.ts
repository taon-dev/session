import { TaonSessionUserIdentityState } from './taon-session-user-identity.models';

export namespace TaonSessionUserIdentityUtils {
  export function isActive(state: string): state is TaonSessionUserIdentityState {
    return state === 'active';
  }
}