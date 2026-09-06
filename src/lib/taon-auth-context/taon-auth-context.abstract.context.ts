//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonAuthContext } from './taon-auth-context.entity';
import { TaonAuthContextController } from './taon-auth-context.controller';
import { TaonAuthContextRepository } from './taon-auth-context.repository';
import { TaonAuthContextProvider } from './taon-auth-context.provider';
import { TaonAuthContextMiddleware } from './taon-auth-context.middleware';
import { TaonAuthContextSubscriber } from './taon-auth-context.subscriber';
//#endregion

export const TaonAuthContextContext = createContext(() => ({
  contextName: 'TaonAuthContextContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonAuthContext },
  controllers: { TaonAuthContextController },
  repositories: { TaonAuthContextRepository },
  providers: { TaonAuthContextProvider },
  middlewares: { TaonAuthContextMiddleware },
  subscribers: { TaonAuthContextSubscriber },
}));