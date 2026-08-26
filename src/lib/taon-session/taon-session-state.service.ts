import { inject, Injectable, signal } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  finalize,
  map,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { TaonStateMachine } from 'tnp-core/src';

import type { TaonSessionComponent } from './taon-session/taon-session.component';
import { TaonSessionApiService } from './taon-session-api.service';
import {
  TaonErorsMap,
  TaonLoginErrors,
  TaonSessionState,
} from './taon-session.models';

@Injectable()
export class TaonSessionStateService {
  protected readonly taonSessionApiService = inject(TaonSessionApiService);

  protected refreshSrc = new BehaviorSubject(void 0);

  protected userId = signal<number | undefined>(void 0);

  protected currentSlide = signal(TaonSessionState.LOADING_INITIAL_AUTH_INFO);

  private allowedStateMap = new Map<TaonSessionState, TaonSessionState[]>([
    [
      TaonSessionState.LOADING_INITIAL_AUTH_INFO,
      [TaonSessionState.LOGIN_OR_REGISTER, TaonSessionState.LOGIN_SUCCESS],
    ],
    [
      TaonSessionState.LOGIN_OR_REGISTER,
      [TaonSessionState.ENTER_PASSWORD, TaonSessionState.LOADING_AUTH],
    ],
    [
      TaonSessionState.ENTER_PASSWORD,
      [
        TaonSessionState.ENTER_PASSWORD,
        TaonSessionState.LOADING_AUTH,
        TaonSessionState.TWO_FA_AUTHENTICATOR,
        TaonSessionState.TWO_FA_EMAIL,
        TaonSessionState.TWO_FA_SMS,
      ],
    ],
    [
      TaonSessionState.LOADING_AUTH,
      [
        TaonSessionState.ENTER_PASSWORD,
        TaonSessionState.LOGIN_OR_REGISTER,
        TaonSessionState.LOGIN_SUCCESS,
      ],
    ],
    [
      TaonSessionState.LOGIN_SUCCESS,
      [TaonSessionState.LOADING_LOGOUT_INFO, TaonSessionState.ENTER_PASSWORD],
    ],
    [
      TaonSessionState.LOADING_LOGOUT_INFO,
      [TaonSessionState.LOGIN_OR_REGISTER, TaonSessionState.LOGIN_SUCCESS],
    ],
  ]);

  public state = new TaonStateMachine<TaonSessionState>({
    defaultValue: this.currentSlide(),
    allowedStateMap: this.allowedStateMap,
    effect: (nextState, previousState, debugMode) => {
      // console.log('GOTO SLIDE' + nextState);
      this.currentSlide.set(nextState);
    },
  });

  protected userId$ = this.refreshSrc.asObservable().pipe(
    tap(() => {
      // console.log('should start load');
    }),
    switchMap(() =>
      this.taonSessionApiService.getCurrentUserId().pipe(
        catchError(() => {
          this.state.set(TaonSessionState.LOGIN_OR_REGISTER);
          return of(void 0);
        }),
      ),
    ),
    tap(userId => {
      const isLoggedIn = !!userId;
      if (isLoggedIn) {
        this.state.set(TaonSessionState.LOGIN_SUCCESS);
      } else {
        this.state.set(TaonSessionState.LOGIN_OR_REGISTER);
      }
      this.userId.set(userId);
    }),
  );

  public isLoggedIn$ = this.userId$.pipe(
    map(userId => {
      const isLoggedIn = !!userId;
      // console.log({ isLoggedIn });
      return isLoggedIn;
    }),
  );

  private static idOfInstnace = 0;

  constructor() {
    // console.log(
    //   `Creating instance no. ${++TaonSessionStateService.idOfInstnace}`,
    // );
  }

  public loginByEmail(form: TaonSessionComponent['form']): void {
    switch (this.state.currentValue) {
      case TaonSessionState.LOGIN_OR_REGISTER:
        this.state.set(TaonSessionState.ENTER_PASSWORD);
        return;

      case TaonSessionState.ENTER_PASSWORD:
        const passwordField = form.controls.password;
        passwordField.markAsTouched();

        this.state.set(TaonSessionState.LOADING_AUTH);
        this.taonSessionApiService
          .login(form.controls.email.value, passwordField.value)
          .pipe(
            take(1),
            tap(okLogin => {
              console.log({ okLogin });
              if (okLogin) {
                this.state.set(TaonSessionState.LOGIN_SUCCESS);
                passwordField.markAsUntouched();
              } else {
                this.state.set(TaonSessionState.ENTER_PASSWORD);
                passwordField.setErrors({
                  ...(passwordField.errors ?? {}),
                  [TaonLoginErrors.INVALID_PASSWORD]: true,
                });

                passwordField.markAsTouched();
              }
            }),
            finalize(() => {
              this.refreshSrc.next(void 0);
            }),
          )
          .subscribe();
        return;

      default:
        break;
    }
  }

  public logout(): void {
    this.state.set(TaonSessionState.LOADING_LOGOUT_INFO);
    this.taonSessionApiService
      .logout()
      .pipe(
        take(1),
        tap(logoutOk => {
          if (logoutOk) {
            this.state.set(TaonSessionState.LOGIN_OR_REGISTER);
          } else {
            this.state.set(TaonSessionState.LOGIN_SUCCESS);
          }
        }),
        finalize(() => {
          this.refreshSrc.next(void 0);
        }),
      )
      .subscribe();
  }

  public refresh(): void {
    this.refreshSrc.next(void 0);
  }
}
