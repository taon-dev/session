//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonNotificationRecipientEntity } from './taon-notification-recipient.entity';
import { TaonNotificationController } from './taon-notification.controller';
import { TaonNotificationEntity } from './taon-notification.entity';
import { TaonNotificationMiddleware } from './taon-notification.middleware';
import { TaonNotificationProvider } from './taon-notification.provider';
import { TaonNotificationRepository } from './taon-notification.repository';
import { TaonNotificationSubscriber } from './taon-notification.subscriber';
//#endregion

export const TaonNotificationContext = createContext(() => ({
  contextName: 'TaonNotificationContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonNotificationEntity, TaonNotificationRecipientEntity },
  controllers: { TaonNotificationController },
  repositories: { TaonNotificationRepository },
  providers: { TaonNotificationProvider },
  middlewares: { TaonNotificationMiddleware },
  subscribers: { TaonNotificationSubscriber },
}));
