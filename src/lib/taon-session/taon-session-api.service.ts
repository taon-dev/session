//#region imports
import { Injectable } from '@angular/core';
import { NEVER, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonSessionController } from './taon-session.controller';
//#endregion

@Injectable()
export class TaonSessionApiService extends TaonBaseAngularService {
  private taonSessionController = this.injectController(TaonSessionController);

  //#region login

  login(email: string, password: string): Observable<boolean> {
    return this.taonSessionController.login({
      email,
      password,
    }).request!().observable.pipe(
      map(resp => {
        return !!resp.body.booleanValue;
      }),
      catchError(() => {
        return of(false);
      }),
    );
  }
  //#endregion

  //#region logout
  logout(): Observable<boolean> {
    return this.taonSessionController.logout().request!().observable.pipe(
      map(resp => {
        return !!resp.body.booleanValue;
      }),
      catchError(() => {
        return of(false);
      }),
    );
  }
  //#endregion

  //#region me
  me(): Observable<string> {
    return this.taonSessionController.me().request!().observable.pipe(
      map(resp => {
        const text = resp.body.text;
        return text;
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }
  //#endregion

  //#region refresh
  refresh(): Observable<boolean> {
    return this.taonSessionController.refresh().request!().observable.pipe(
      map(resp => {
        return !!resp.body.booleanValue;
      }),
      catchError(() => {
        return of(false);
      }),
    );
  }
  //#endregion
}
