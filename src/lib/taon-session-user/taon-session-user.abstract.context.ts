//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonSessionUserGroupEntity } from './taon-session-user-group.entity';
import { TaonSessionUserRoleEntity } from './taon-session-user-role.entity';
import { TaonSessionUserController } from './taon-session-user.controller';
import { TaonSessionUserEntity } from './taon-session-user.entity';
import { TaonSessionUserMiddleware } from './taon-session-user.middleware';
import { TaonSessionUserProvider } from './taon-session-user.provider';
import { TaonSessionUserRepository } from './taon-session-user.repository';
import { TaonSessionUserSubscriber } from './taon-session-user.subscriber';
//#endregion

export const TaonSessionUserContext = createContext(() => ({
  contextName: 'TaonSessionUserContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: {
    TaonSessionUserEntity,
    TaonSessionUserGroupEntity,
    TaonSessionUserRoleEntity,
  },
  controllers: { TaonSessionUserController },
  repositories: { TaonSessionUserRepository },
  providers: { TaonSessionUserProvider },
  middlewares: { TaonSessionUserMiddleware },
  subscribers: { TaonSessionUserSubscriber },
}));
