//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonRole } from './taon-role.entity';
import { TaonRoleController } from './taon-role.controller';
import { TaonRoleRepository } from './taon-role.repository';
import { TaonRoleProvider } from './taon-role.provider';
import { TaonRoleMiddleware } from './taon-role.middleware';
import { TaonRoleSubscriber } from './taon-role.subscriber';
//#endregion

export const TaonRoleContext = createContext(() => ({
  contextName: 'TaonRoleContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonRole },
  controllers: { TaonRoleController },
  repositories: { TaonRoleRepository },
  providers: { TaonRoleProvider },
  middlewares: { TaonRoleMiddleware },
  subscribers: { TaonRoleSubscriber },
}));