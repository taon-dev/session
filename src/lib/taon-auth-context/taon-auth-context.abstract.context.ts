//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonAuthContextEntity } from './taon-auth-context.entity';
import { TaonAuthContextRepository } from './taon-auth-context.repository';
//#endregion

export const TaonAuthContextContext = createContext(() => ({
  contextName: 'TaonAuthContextContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonAuthContextEntity },
  repositories: { TaonAuthContextRepository },
}));
