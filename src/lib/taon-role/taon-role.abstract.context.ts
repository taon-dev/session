//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonRolePermission } from './taon-role-permission.entity';
import { TaonRoleController } from './taon-role.controller';
import { TaonRole } from './taon-role.entity';
import { TaonRoleMiddleware } from './taon-role.middleware';
import { TaonRoleProvider } from './taon-role.provider';
import { TaonRoleRepository } from './taon-role.repository';
import { TaonRoleSubscriber } from './taon-role.subscriber';
//#endregion

export const TaonRoleContext = createContext(() => ({
  contextName: 'TaonRoleContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonRole, TaonRolePermission },
  controllers: { TaonRoleController },
  repositories: { TaonRoleRepository },
  providers: { TaonRoleProvider },
  middlewares: { TaonRoleMiddleware },
  subscribers: { TaonRoleSubscriber },
}));
