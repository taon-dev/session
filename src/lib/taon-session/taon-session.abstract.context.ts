//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonSessionKvRepository } from './taon-session-kv.repository';
import { TaonSessionUser } from './taon-session-user.entity';
import { TaonSessionUserRepository } from './taon-session-user.repository';
import { TaonSessionController } from './taon-session.controller';
import { TaonSessionMiddleware } from './taon-session.middleware';
import { TaonSessionProvider } from './taon-session.provider';
import { TaonSessionStateService } from './taon-session.state.service';
//#endregion

export const TaonSessionContext = createContext(() => ({
  contextName: 'TaonSessionContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonSessionUser },
  controllers: { TaonSessionController },
  repositories: { TaonSessionKvRepository, TaonSessionUserRepository },
  providers: { TaonSessionProvider
    // TOOD create stat new .state.ts class for state abstraction
    // , TaonSessionStateService
  },
  logs: true,
  disabledRealtime: true,
  middlewares: { TaonSessionMiddleware },
  subscribers: {},
}));
