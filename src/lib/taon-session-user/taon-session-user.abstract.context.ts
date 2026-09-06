//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonSessionUserGroup } from './taon-session-user-group.entity';
import { TaonSessionUserRole } from './taon-session-user-role.entity';
import { TaonSessionUserController } from './taon-session-user.controller';
import { TaonSessionUser } from './taon-session-user.entity';
import { TaonSessionUserMiddleware } from './taon-session-user.middleware';
import { TaonSessionUserProvider } from './taon-session-user.provider';
import { TaonSessionUserRepository } from './taon-session-user.repository';
import { TaonSessionUserSubscriber } from './taon-session-user.subscriber';
//#endregion

export const TaonSessionUserContext = createContext(() => ({
  contextName: 'TaonSessionUserContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonSessionUser, TaonSessionUserGroup, TaonSessionUserRole },
  controllers: { TaonSessionUserController },
  repositories: { TaonSessionUserRepository },
  providers: { TaonSessionUserProvider },
  middlewares: { TaonSessionUserMiddleware },
  subscribers: { TaonSessionUserSubscriber },
}));
