import { TaonAuthContextState } from './taon-auth-context.models';

export namespace TaonAuthContextUtils {
  export function isActive(state: string): state is TaonAuthContextState {
    return state === 'active';
  }
}