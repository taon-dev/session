//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonSessionUserContext } from '../taon-session-user/taon-session-user.abstract.context';

import { TaonSessionKvRepository } from './taon-session-kv.repository';
import { TaonSessionController } from './taon-session.controller';
import { TaonSessionMiddleware } from './taon-session.middleware';
import { TaonSessionProvider } from './taon-session.provider';
import { TaonSessionStateService } from './taon-session.state.service';
//#endregion

export const TaonSessionContext = createContext(() => ({
  contextName: 'TaonSessionContext',
  abstract: true,
  contexts: { TaonBaseContext, TaonSessionUserContext },
  entities: {},
  controllers: { TaonSessionController },
  repositories: { TaonSessionKvRepository },
  providers: {
    TaonSessionProvider,
    // TOOD create stat new .state.ts class for state abstraction
    // , TaonSessionStateService
  },
  logs: true,
  disabledRealtime: true,
  middlewares: { TaonSessionMiddleware },
  subscribers: {},
}));
