import { TaonPermissionState } from './taon-permission.models';

export namespace TaonPermissionUtils {
  export function isActive(state: string): state is TaonPermissionState {
    return state === 'active';
  }
}