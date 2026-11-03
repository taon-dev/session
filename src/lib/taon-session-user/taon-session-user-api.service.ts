import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonSessionUserController } from './taon-session-user.controller';
import type { TaonSessionUserAccountStatusUpdate } from './taon-session-user.controller';
import type { TaonSessionUserEntity } from './taon-session-user.entity';

@Injectable()
export class TaonSessionUserApiService extends TaonBaseAngularService {
  public taonSessionUserController = this.injectController(
    TaonSessionUserController,
  );

  async setAccountStatus(
    userId: number,
    update: TaonSessionUserAccountStatusUpdate,
  ): Promise<TaonSessionUserEntity> {
    const response = await this.taonSessionUserController
      .setAccountStatus(userId, update)
      .request!();
    if (response.statusCode >= 400 || !response.body?.json) {
      throw new Error(
        response.responseText || 'Unable to update the user account status.',
      );
    }
    return response.body.json;
  }

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
