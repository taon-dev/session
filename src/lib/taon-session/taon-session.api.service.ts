//#region imports
import { Injectable } from '@angular/core';
import { NEVER, Observable, of } from 'rxjs';
import { catchError, map, share, tap } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonAuthContextEntity } from '../taon-auth-context/taon-auth-context.entity';
import { TaonSessionUserEntity } from '../taon-session-user/taon-session-user.entity';
import { TaonSessionIdentityProvider } from '../taon-session-user/taon-session-user.models';

import { TaonSessionController } from './taon-session.controller';
import { TaonLoginData } from './taon-session.models';
//#endregion

@Injectable()
export class TaonSessionApiService extends TaonBaseAngularService {
  private taonSessionController = this.injectController(TaonSessionController);

  usernameAvailable(username: string): Observable<boolean> {
    return this.taonSessionController.usernameAvailable(username)
      .request!().observable.pipe(map(resp => !!resp.body.booleanValue));
  }

  changeUsername(username: string): Observable<boolean> {
    return this.taonSessionController.changeUsername(username)
      .request!().observable.pipe(map(resp => !!resp.body.booleanValue));
  }

  connectPassword(email: string, password: string): Observable<boolean> {
    return this.taonSessionController.connectIdentity({ email, password })
      .request!().observable.pipe(map(resp => !!resp.body.booleanValue));
  }

  //#region login

  login(data: TaonLoginData): Observable<boolean> {
    return this.taonSessionController.login(data).request!().observable.pipe(
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

  //#region connect idenitty
  connectIdentity(data: TaonLoginData): Observable<boolean> {
    return this.taonSessionController.connectIdentity(data)
      .request!().observable.pipe(
      map(resp => {
        return !!resp.body.booleanValue;
      }),
      catchError(() => {
        return of(false);
      }),
    );
  }
  //#endregion

  //#region disconnect idenitty
  disconnectIdentity(
    provider: TaonSessionIdentityProvider,
  ): Observable<boolean> {
    return this.taonSessionController.disconnectIdentity(provider)
      .request!().observable.pipe(
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
  context(): Observable<TaonAuthContextEntity> {
    return this.taonSessionController.context().request!().observable.pipe(
      map(resp => {
        return resp.body.json;
      }),
      catchError(() => {
        return of(null);
      }),
    );
  }

  emptyContext(): Observable<TaonAuthContextEntity> {
    return this.taonSessionController.emptyContext().request!().observable.pipe(
      map(resp => {
        return resp.body.json;
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
      share(),
    );
  }
  //#endregion

  //#region get current user id
  userExists(
    email: string,
    opt: {
      goToPreviouseState: () => void;
    },
  ): Observable<boolean> {
    return this.taonSessionController.userExists(email)
      .request!().observable.pipe(
      map(resp => {
        const userExists = resp.body.booleanValue;
        return userExists;
      }),
      catchError(() => {
        opt.goToPreviouseState();
        return NEVER;
      }),
    );
  }
  //#endregion

  //#region get current user id
  createUser(
    email: string,
    password: string,
  ): Observable<TaonSessionUserEntity | undefined> {
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
