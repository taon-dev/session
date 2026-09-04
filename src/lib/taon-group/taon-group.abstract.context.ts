//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonGroup } from './taon-group.entity';
import { TaonGroupController } from './taon-group.controller';
import { TaonGroupRepository } from './taon-group.repository';
import { TaonGroupProvider } from './taon-group.provider';
import { TaonGroupMiddleware } from './taon-group.middleware';
//#endregion

export const TaonGroupContext = createContext(() => ({
  contextName: 'TaonGroupContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonGroup },
  controllers: { TaonGroupController },
  repositories: { TaonGroupRepository },
  providers: { TaonGroupProvider },
  middlewares: { TaonGroupMiddleware },
}));
