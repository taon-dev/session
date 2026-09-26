import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonAuthContextController } from './taon-auth-context.controller';
import type { TaonAuthContextEntity } from './taon-auth-context.entity';

@Injectable()
export class TaonAuthContextApiService extends TaonBaseAngularService {
  private taonAuthContextController = this.injectController(
    TaonAuthContextController,
  );

  public get allMyEntities$(): Observable<TaonAuthContextEntity[]> {
    return this.taonAuthContextController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }
}
