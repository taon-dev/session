import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonGroup } from './taon-group.entity';
import { TaonGroupController } from './taon-group.controller';

@Injectable()
export class TaonGroupApiService extends TaonBaseAngularService {
  private taonGroupController = this.injectController(TaonGroupController);

  public get allMyEntities$(): Observable<TaonGroup[]> {
    return this.taonGroupController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user): Observable<string> {
    return this.taonGroupController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}