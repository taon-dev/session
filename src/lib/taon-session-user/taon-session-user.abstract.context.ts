//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonSessionUser } from './taon-session-user.entity';
import { TaonSessionUserController } from './taon-session-user.controller';
import { TaonSessionUserRepository } from './taon-session-user.repository';
import { TaonSessionUserProvider } from './taon-session-user.provider';
import { TaonSessionUserMiddleware } from './taon-session-user.middleware';
import { TaonSessionUserSubscriber } from './taon-session-user.subscriber';
//#endregion

export const TaonSessionUserContext = createContext(() => ({
  contextName: 'TaonSessionUserContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonSessionUser },
  controllers: { TaonSessionUserController },
  repositories: { TaonSessionUserRepository },
  providers: { TaonSessionUserProvider },
  middlewares: { TaonSessionUserMiddleware },
  subscribers: { TaonSessionUserSubscriber },
}));