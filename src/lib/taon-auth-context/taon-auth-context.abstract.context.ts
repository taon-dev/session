//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonAuthContext } from './taon-auth-context.entity';
import { TaonAuthContextController } from './taon-auth-context.controller';
import { TaonAuthContextRepository } from './taon-auth-context.repository';
//#endregion

export const TaonAuthContextContext = createContext(() => ({
  contextName: 'TaonAuthContextContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonAuthContext },
  controllers: { TaonAuthContextController },
  repositories: { TaonAuthContextRepository },
}));