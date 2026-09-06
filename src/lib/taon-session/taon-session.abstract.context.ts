//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonAuthContextContext } from '../taon-auth-context/taon-auth-context.abstract.context';
import { TaonGroupContext } from '../taon-group/taon-group.abstract.context';
import { TaonPermissionContext } from '../taon-permission/taon-permission.abstract.context';
import { TaonRoleContext } from '../taon-role/taon-role.abstract.context';
import { TaonSessionUserContext } from '../taon-session-user/taon-session-user.abstract.context';
import { TaonSessionUserIdentityContext } from '../taon-session-user-identity/taon-session-user-identity.abstract.context';

import { TaonSessionKvRepository } from './taon-session-kv.repository';
import { TaonSessionController } from './taon-session.controller';
import { TaonSession } from './taon-session.entity';
import { TaonSessionMiddleware } from './taon-session.middleware';
import { TaonSessionProvider } from './taon-session.provider';
import { TaonSessionStateService } from './taon-session.state.service';
//#endregion

export const TaonSessionContext = createContext(() => ({
  contextName: 'TaonSessionContext',
  abstract: true,
  contexts: {
    TaonBaseContext,
    TaonSessionUserContext,
    TaonAuthContextContext,
    TaonGroupContext,
    TaonPermissionContext,
    TaonRoleContext,
    TaonSessionUserIdentityContext,
  },
  entities: { TaonSession },
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
