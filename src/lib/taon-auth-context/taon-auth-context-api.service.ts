import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonAuthContext } from './taon-auth-context.entity';
import { TaonAuthContextController } from './taon-auth-context.controller';

@Injectable()
export class TaonAuthContextApiService extends TaonBaseAngularService {
  private taonAuthContextController = this.injectController(TaonAuthContextController);

  public get allMyEntities$(): Observable<TaonAuthContext[]> {
    return this.taonAuthContextController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user): Observable<string> {
    return this.taonAuthContextController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}