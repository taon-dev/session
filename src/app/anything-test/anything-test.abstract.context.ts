//#region imports
import { createContext, TaonBaseContext } from 'taon/src';

import { AnythingTest } from './anything-test.entity';
import { AnythingTestController } from './anything-test.controller';
import { AnythingTestRepository } from './anything-test.repository';
//#endregion

export const AnythingTestContext = createContext(() => ({
  contextName: 'AnythingTestContext',
  abstract: true,
  contexts: { TaonBaseContext },
  entities: { AnythingTest },
  controllers: { AnythingTestController },
  repositories: { AnythingTestRepository },
}));