import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonAuditEventsController } from './taon-audit-events.controller';
import type { TaonAuditEventsEntity } from './taon-audit-events.entity';

@Injectable()
export class TaonAuditEventsApiService extends TaonBaseAngularService {
  private taonAuditEventsController = this.injectController(TaonAuditEventsController);

  public get allMyEntities$(): Observable<TaonAuditEventsEntity[]> {
    return this.taonAuditEventsController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user:string): Observable<string> {
    return this.taonAuditEventsController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}
