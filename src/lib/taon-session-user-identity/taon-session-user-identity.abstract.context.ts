//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonSessionUserIdentity } from './taon-session-user-identity.entity';
import { TaonSessionUserIdentityController } from './taon-session-user-identity.controller';
import { TaonSessionUserIdentityRepository } from './taon-session-user-identity.repository';
import { TaonSessionUserIdentityProvider } from './taon-session-user-identity.provider';
import { TaonSessionUserIdentityMiddleware } from './taon-session-user-identity.middleware';
import { TaonSessionUserIdentitySubscriber } from './taon-session-user-identity.subscriber';
//#endregion

export const TaonSessionUserIdentityContext = createContext(() => ({
  contextName: 'TaonSessionUserIdentityContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonSessionUserIdentity },
  controllers: { TaonSessionUserIdentityController },
  repositories: { TaonSessionUserIdentityRepository },
  providers: { TaonSessionUserIdentityProvider },
  middlewares: { TaonSessionUserIdentityMiddleware },
  subscribers: { TaonSessionUserIdentitySubscriber },
}));