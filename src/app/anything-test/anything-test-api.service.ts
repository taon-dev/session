import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { AnythingTestController } from './anything-test.controller';

@Injectable()
export class AnythingTestApiService extends TaonBaseAngularService {
  protected anythingTestController = this.injectController(AnythingTestController);

  public hello(): Observable<string> {
    return this.anythingTestController.helloWord('anything-test')
      .request!().observable.pipe(map(res => res.body.text!));
  }
}