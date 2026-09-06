//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonGroupRole } from './taon-group-role.entity';
import { TaonGroupController } from './taon-group.controller';
import { TaonGroup } from './taon-group.entity';
import { TaonGroupMiddleware } from './taon-group.middleware';
import { TaonGroupProvider } from './taon-group.provider';
import { TaonGroupRepository } from './taon-group.repository';
//#endregion

export const TaonGroupContext = createContext(() => ({
  contextName: 'TaonGroupContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonGroup, TaonGroupRole },
  controllers: { TaonGroupController },
  repositories: { TaonGroupRepository },
  providers: { TaonGroupProvider },
  middlewares: { TaonGroupMiddleware },
}));
