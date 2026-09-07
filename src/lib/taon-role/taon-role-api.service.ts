import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonRoleEntity } from './taon-role.entity';
import { TaonRoleController } from './taon-role.controller';

@Injectable()
export class TaonRoleApiService extends TaonBaseAngularService {
  private taonRoleController = this.injectController(TaonRoleController);

  public get allMyEntities$(): Observable<TaonRoleEntity[]> {
    return this.taonRoleController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user): Observable<string> {
    return this.taonRoleController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}
