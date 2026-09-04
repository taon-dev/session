//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonPermissionController } from './taon-permission.controller';
import { TaonPermission } from './taon-permission.entity';
import { TaonPermissionMiddleware } from './taon-permission.middleware';
import { TaonPermissionProvider } from './taon-permission.provider';
import { TaonPermissionRepository } from './taon-permission.repository';
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
