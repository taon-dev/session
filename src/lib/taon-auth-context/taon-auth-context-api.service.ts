import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonAuthContextController } from './taon-auth-context.controller';

@Injectable()
export class TaonAuthContextApiService extends TaonBaseAngularService {
  protected taonAuthContextController = this.injectController(TaonAuthContextController);

  public hello(): Observable<string> {
    return this.taonAuthContextController.helloWord('taon-auth-context')
      .request!().observable.pipe(map(res => res.body.text!));
  }
}