//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonAuditEventsEntity } from './taon-audit-events.entity';
import { TaonAuditEventsController } from './taon-audit-events.controller';
import { TaonAuditEventsRepository } from './taon-audit-events.repository';
import { TaonAuditEventsProvider } from './taon-audit-events.provider';
import { TaonAuditEventsMiddleware } from './taon-audit-events.middleware';
import { TaonAuditEventsSubscriber } from './taon-audit-events.subscriber';
//#endregion

export const TaonAuditEventsContext = createContext(() => ({
  contextName: 'TaonAuditEventsContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonAuditEventsEntity },
  controllers: { TaonAuditEventsController },
  repositories: { TaonAuditEventsRepository },
  providers: { TaonAuditEventsProvider },
  middlewares: { TaonAuditEventsMiddleware },
  subscribers: { TaonAuditEventsSubscriber },
}));