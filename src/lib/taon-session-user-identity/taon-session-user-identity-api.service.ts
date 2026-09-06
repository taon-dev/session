import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonSessionUserIdentity } from './taon-session-user-identity.entity';
import { TaonSessionUserIdentityController } from './taon-session-user-identity.controller';

@Injectable()
export class TaonSessionUserIdentityApiService extends TaonBaseAngularService {
  private taonSessionUserIdentityController = this.injectController(TaonSessionUserIdentityController);

  public get allMyEntities$(): Observable<TaonSessionUserIdentity[]> {
    return this.taonSessionUserIdentityController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user): Observable<string> {
    return this.taonSessionUserIdentityController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}