import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonSessionUser } from './taon-session-user.entity';
import { TaonSessionUserController } from './taon-session-user.controller';

@Injectable()
export class TaonSessionUserApiService extends TaonBaseAngularService {
  private taonSessionUserController = this.injectController(
    TaonSessionUserController,
  );

  // public get allMyEntities$(): Observable<TaonSessionUser[]> {
  //   return this.taonSessionUserController.getAll().request!().observable.pipe(
  //     map(res => res.body?.json),
  //   );
  // }

  // public helloWorld(user): Observable<string> {
  //   return this.taonSessionUserController.helloWord(user).request!().observable.pipe(
  //     map(res => res.responseText as string),
  //   );
  // }
}
