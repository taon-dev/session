//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { TaonProfileController } from './taon-profile.controller';
import { TaonProfileEntity } from './taon-profile.entity';
import { TaonProfileProvider } from './taon-profile.provider';
// import { TaonProfileRepository } from './taon-profile.repository';
// import { TaonProfileKvRepository } from './taon-profile.kv.repository';
// import { TaonProfileMiddleware } from './taon-profile.middleware';
// import { TaonProfileSubscriber } from './taon-profile.subscriber';
//#endregion

export const TaonProfileAbstractContext = createContext(() => ({
  contextName: 'TaonProfileAbstractContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { TaonProfileEntity },
  controllers: { TaonProfileController },
  // repositories: {
  //   // TaonProfileKvRepository
  //   TaonProfileRepository,
  // },
  providers: { TaonProfileProvider },
  // middlewares: { TaonProfileMiddleware },
  // subscribers: { TaonProfileSubscriber },
}));
