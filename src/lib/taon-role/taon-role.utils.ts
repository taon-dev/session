import { TaonRoleState } from './taon-role.models';

export namespace TaonRoleUtils {
  export function isActive(state: string): state is TaonRoleState {
    return state === 'active';
  }
}