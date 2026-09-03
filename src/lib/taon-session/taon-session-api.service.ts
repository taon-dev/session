//#region imports
import { Injectable } from '@angular/core';
import { NEVER, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonSessionUser } from '../taon-session-user/taon-session-user.entity';

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

  //#region get current user id
  getCurrentUserId(): Observable<number> {
    return this.taonSessionController.getCurrentUserId()
      .request!().observable.pipe(
      map(resp => {
        const userId = resp.body.numericValue;
        return userId;
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }
  //#endregion

  //#region get current user id
  userExists(email: string): Observable<boolean> {
    return this.taonSessionController.userExists(email)
      .request!().observable.pipe(
      map(resp => {
        const userExists = resp.body.booleanValue;
        return userExists;
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }
  //#endregion

  //#region get current user id
  createUser(
    email: string,
    password: string,
  ): Observable<TaonSessionUser | undefined> {
    return this.taonSessionController.createUser(email, password)
      .request!().observable.pipe(
      map(resp => {
        const userExists = resp.body.json;
        return userExists;
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
