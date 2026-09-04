import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonPermission } from './taon-permission.entity';
import { TaonPermissionController } from './taon-permission.controller';

@Injectable()
export class TaonPermissionApiService extends TaonBaseAngularService {
  private taonPermissionController = this.injectController(TaonPermissionController);

  public get allMyEntities$(): Observable<TaonPermission[]> {
    return this.taonPermissionController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  public helloWorld(user): Observable<string> {
    return this.taonPermissionController.helloWord(user).request!().observable.pipe(
      map(res => res.responseText as string),
    );
  }
}