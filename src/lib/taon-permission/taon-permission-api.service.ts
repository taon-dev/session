import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import type { TaonPermissionEntity } from './taon-permission.entity';
import { TaonPermissionController } from './taon-permission.controller';

@Injectable()
export class TaonPermissionApiService extends TaonBaseAngularService {
  public taonPermissionController = this.injectController(
    TaonPermissionController,
  );

  public get allMyEntities$(): Observable<TaonPermissionEntity[]> {
    return this.taonPermissionController.getAll().request!().observable.pipe(
      map(res => res.body?.json),
    );
  }

  //#region methods / all permissions

  async getAllPermissions(): Promise<TaonPermissionEntity[]> {
    const response = await this.taonPermissionController.getAll().request();

    return response.body?.json ?? [];
  }

  //#endregion

  //#region methods / description

  async updateDescription(
    permissionId: number,
    description: string,
  ): Promise<TaonPermissionEntity> {
    const response = await this.taonPermissionController
      .updateDescription(permissionId, description)
      .request();

    return response.body?.json;
  }

  //#endregion
}
