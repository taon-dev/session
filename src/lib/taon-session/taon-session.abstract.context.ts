//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonAuditEventsContext, TaonNotificationContext } from '../index';
import { TaonAuthContextContext } from '../taon-auth-context/taon-auth-context.abstract.context';
import { TaonGroupContext } from '../taon-group/taon-group.abstract.context';
import { TaonPermissionContext } from '../taon-permission/taon-permission.abstract.context';
import { TaonRoleContext } from '../taon-role/taon-role.abstract.context';
import { TaonSessionUserContext } from '../taon-session-user/taon-session-user.abstract.context';
import { TaonSessionUserIdentityContext } from '../taon-session-user-identity/taon-session-user-identity.abstract.context';

import { TaonSessionKvRepository } from './taon-session-kv.repository';
import { TaonSessionController } from './taon-session.controller';
import { TaonSessionEntity } from './taon-session.entity';
import { TaonSessionMiddleware } from './taon-session.middleware';
import { TaonSessionProvider } from './taon-session.provider';
import { TaonSessionStateService } from './taon-session.state.service';
//#endregion

export const TaonSessionAbstractContext = createContext(() => ({
  contextName: 'TaonSessionAbstractContext',
  abstract: true,
  contexts: {
    TaonBaseContext,
    TaonSessionUserContext,
    TaonAuthContextContext,
    TaonGroupContext,
    TaonPermissionContext,
    TaonRoleContext,
    TaonSessionUserIdentityContext,
    TaonNotificationContext,
    TaonAuditEventsContext,
  },
  entities: { TaonSessionEntity: TaonSessionEntity },
  controllers: { TaonSessionController },
  repositories: { TaonSessionKvRepository },
  providers: {
    TaonSessionProvider,
    /**
     * TODO somehow inject(TaonSessionApiService)
     * when creating manuall instace of TaonSessionStateService.
     * This state service could usefull on backend
     */
    // TaonSessionStateService,
  },
  logs: true,
  disabledRealtime: true,
  middlewares: { TaonSessionMiddleware },
  subscribers: {},
}));
