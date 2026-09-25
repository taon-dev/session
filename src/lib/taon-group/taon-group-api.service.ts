import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonGroupController } from './taon-group.controller';
import type { TaonGroupEntity } from './taon-group.entity';

@Injectable()
export class TaonGroupApiService extends TaonBaseAngularService {
  public taonGroupController = this.injectController(TaonGroupController);

  public get allMyEntities$(): Observable<TaonGroupEntity[]> {
    return this.taonGroupController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }
}
