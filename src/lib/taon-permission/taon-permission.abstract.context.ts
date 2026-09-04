//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonPermission } from './taon-permission.entity';
import { TaonPermissionController } from './taon-permission.controller';
import { TaonPermissionRepository } from './taon-permission.repository';
import { TaonPermissionProvider } from './taon-permission.provider';
import { TaonPermissionMiddleware } from './taon-permission.middleware';
import { TaonPermissionSubscriber } from './taon-permission.subscriber';
//#endregion

export const TaonPermissionContext = createContext(() => ({
  contextName: 'TaonPermissionContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonPermission },
  controllers: { TaonPermissionController },
  repositories: { TaonPermissionRepository },
  providers: { TaonPermissionProvider },
  middlewares: { TaonPermissionMiddleware },
  subscribers: { TaonPermissionSubscriber },
}));