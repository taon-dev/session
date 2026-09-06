//#region imports
import {
  Taon,
  ClassHelpers,
  TaonController,
  TaonBaseCrudController,
  GET,
  Query,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { AnythingTest } from './anything-test.entity';
import { AnythingTestRepository } from './anything-test.repository';
//#endregion

@TaonController({
  className: 'AnythingTestController',
})
export class AnythingTestController extends TaonBaseCrudController<AnythingTest> {
  entityClassResolveFn: () => typeof AnythingTest = () => AnythingTest;

  anythingTestRepository = this.injectCustomRepository(AnythingTestRepository);

  //#region methods & getters / hello world
  @GET()
  helloWord(@Query('yourName') yourName: string): Taon.Response<string> {
    //#region @websqlFunc
    return async (req, res) => {
      const numOfEntities = await this.db.count();
      return (
        `Hello ${yourName || 'world'} from ${ClassHelpers.getName(AnythingTestController)} ` +
        `controller..  ${numOfEntities} entites in db..`
      );
    };
    //#endregion
  }
  //#endregion
}