import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonNotificationEntity } from './taon-notification.entity';
import { TaonNotificationController } from './taon-notification.controller';

@Injectable()
export class TaonNotificationApiService extends TaonBaseAngularService {
  private taonNotificationController = this.injectController(TaonNotificationController);

  public get allMyEntities$(): Observable<TaonNotificationEntity[]> {
    return this.taonNotificationController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user:string): Observable<string> {
    return this.taonNotificationController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}