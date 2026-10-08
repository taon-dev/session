//#region imports

import { inject, Injectable } from '@angular/core'; // @browser

import {
  BehaviorSubject,
  catchError,
  combineLatest,
  finalize,
  map,
  NEVER,
  Observable,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';

import { TaonBaseProvider, TaonProvider } from 'taon/src';
import { signal } from 'tnp-core/src';
import { TaonStateMachine } from 'tnp-core/src';

import { TaonAuthContextEntity } from '../taon-auth-context/taon-auth-context.entity';

import type { TaonSessionComponent } from './taon-session/taon-session.component'; // @browser
import { TaonSessionApiService } from './taon-session.api.service'; // @browser
import {
  TaonErorsMap,
  TaonLoginErrors,
  TaonSessionState,
} from './taon-session.models';

//#endregion

//#region @backend
@TaonProvider({
  className: 'TaonSessionStateService',
})
//#endregion
//#region @browser
@Injectable()
//#endregion
export class TaonSessionStateService extends TaonBaseProvider {
  //#region fields & getters

  //#region @browser
  protected readonly taonSessionApiService = inject(TaonSessionApiService);
  //#endregion

  /**
   * Refreshes session/authentication information.
   *
   * This causes getCurrentUserId() to be called again.
   */
  protected readonly refreshSrc = new BehaviorSubject<void>(void 0);

  /**
   * Refreshes authorization context without reloading
   * the current session/user.
   *
   * Useful when roles/groups/permissions change while
   * the currently authenticated user stays the same.
   */
  protected readonly contextRefreshSrc = new BehaviorSubject<void>(void 0);

  protected readonly userId = signal<number | undefined>(void 0);

  protected readonly currentSlide = signal(
    TaonSessionState.LOADING_INITIAL_AUTH_INFO,
  );

  private allowedStateMap = new Map<TaonSessionState, TaonSessionState[]>([
    [
      TaonSessionState.LOADING_INITIAL_AUTH_INFO,
      [TaonSessionState.LOGIN_OR_REGISTER, TaonSessionState.LOGIN_SUCCESS],
    ],
    [
      TaonSessionState.LOGIN_OR_REGISTER,
      [
        TaonSessionState.ENTER_PASSWORD,
        TaonSessionState.ENTER_REGISTRATION_PASSWORDS,
        TaonSessionState.LOADING_AUTH,
        TaonSessionState.LOADING_CHECK_USER_EMAIL_EXISTS,
      ],
    ],
    [
      TaonSessionState.LOADING_CHECK_USER_EMAIL_EXISTS,
      [
        TaonSessionState.ENTER_PASSWORD,
        TaonSessionState.ENTER_REGISTRATION_PASSWORDS,
        TaonSessionState.LOGIN_OR_REGISTER,
      ],
    ],
    [
      TaonSessionState.ENTER_REGISTRATION_PASSWORDS,
      [TaonSessionState.LOADING_AUTH, TaonSessionState.LOGIN_OR_REGISTER],
    ],
    [
      TaonSessionState.ENTER_PASSWORD,
      [
        TaonSessionState.LOGIN_OR_REGISTER,
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
      [
        TaonSessionState.LOADING_LOGOUT_INFO,
        TaonSessionState.ENTER_PASSWORD,
        TaonSessionState.PROFILE_INFO,
      ],
    ],
    [
      TaonSessionState.PROFILE_INFO,
      [
        TaonSessionState.LOGIN_SUCCESS,
        TaonSessionState.LOADING_LOGOUT_INFO,
        TaonSessionState.ENTER_PASSWORD,
      ],
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
      this.currentSlide.set(nextState);
    },
  });

  /**
   * Current authenticated user.
   *
   * Shared because multiple consumers may depend on userId$,
   * isLoggedIn$ and context$ at the same time.
   *
   * One refresh => one getCurrentUserId() request.
   */
  protected readonly userId$ = this.refreshSrc.pipe(
    switchMap(() => {
      //#region @backend
      return of(1000000);
      //#endregion

      //#region @browser
      return this.taonSessionApiService.getCurrentUserId().pipe(
        catchError(() => {
          this.state.set(TaonSessionState.LOGIN_OR_REGISTER);
          return of(void 0);
        }),
      );
      //#endregion
    }),

    tap(userId => {
      this.userId.set(userId);

      if (userId) {
        this.state.set(TaonSessionState.LOGIN_SUCCESS);
      } else {
        this.state.set(TaonSessionState.LOGIN_OR_REGISTER);
      }
    }),

    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );

  /**
   * Projection of userId$.
   *
   * Does NOT cause another getCurrentUserId() call because
   * userId$ is shared.
   */
  public readonly isLoggedIn$ = this.userId$.pipe(map(userId => !!userId));

  //#region @browser

  /**
   * Current authorization context.
   *
   * Reloaded when:
   *
   * 1. session/user changes
   * 2. refreshContext() is explicitly called
   *
   * Multiple subscribers share the same context request.
   */
  public readonly context$: Observable<TaonAuthContextEntity> = combineLatest([
    this.userId$,
    this.contextRefreshSrc,
  ]).pipe(
    switchMap(([userId]) => {
      if (!userId) {
        return this.taonSessionApiService.emptyContext();
      }

      return this.taonSessionApiService.context();
    }),

    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );

  //#endregion

  //#endregion

  public executeActionForState(
    //#region @browser
    form: TaonSessionComponent['form'],
    //#endregion
  ): void {
    //#region @browser

    form.updateValueAndValidity();

    if (form.invalid) {
      return;
    }

    const googleCodeField = form.controls.googleCode;
    const isSocialLogin = googleCodeField.value!;

    //#region login action

    const loginAction = (): void => {
      const passwordField = form.controls.password;

      if (!isSocialLogin) {
        passwordField.markAsTouched();
      }

      this.state.set(TaonSessionState.LOADING_AUTH);

      this.taonSessionApiService
        .login({
          email: form.controls.email.value!,
          password: passwordField.value!,
          googleCode: googleCodeField.value!,
        })
        .pipe(
          take(1),

          tap(okLogin => {
            googleCodeField.reset();

            if (okLogin) {
              this.state.set(TaonSessionState.LOGIN_SUCCESS);

              if (!isSocialLogin) {
                passwordField.markAsUntouched();
              }
            } else {
              if (isSocialLogin) {
                this.state.set(TaonSessionState.LOGIN_OR_REGISTER);

                googleCodeField.setErrors({
                  [TaonLoginErrors.INVALID_SOCIAL_LOGIN]: true,
                });
              } else {
                this.state.set(TaonSessionState.ENTER_PASSWORD);

                passwordField.setErrors({
                  ...(passwordField.errors ?? {}),
                  [TaonLoginErrors.INVALID_PASSWORD]: true,
                });

                passwordField.markAsTouched();
              }
            }
          }),

          finalize(() => {
            this.refresh();
          }),
        )
        .subscribe();
    };

    //#endregion

    switch (this.state.currentValue) {
      //#region LOGIN_OR_REGISTER

      case TaonSessionState.LOGIN_OR_REGISTER:
        if (isSocialLogin) {
          loginAction();
        } else {
          this.state.set(TaonSessionState.LOADING_CHECK_USER_EMAIL_EXISTS);

          this.taonSessionApiService
            .userExists(form.controls.email.value!, {
              goToPreviouseState: () => {
                this.state.set(TaonSessionState.LOGIN_OR_REGISTER);
              },
            })
            .pipe(
              take(1),

              tap(userExists => {
                if (userExists) {
                  this.state.set(TaonSessionState.ENTER_PASSWORD);
                } else {
                  this.state.set(TaonSessionState.ENTER_REGISTRATION_PASSWORDS);
                }
              }),

              catchError(err => {
                this.state.set(TaonSessionState.LOGIN_OR_REGISTER);
                return NEVER;
              }),
            )
            .subscribe();
        }

        return;

      //#endregion

      //#region ENTER_REGISTRATION_PASSWORDS

      case TaonSessionState.ENTER_REGISTRATION_PASSWORDS:
        this.state.set(TaonSessionState.LOADING_CREATING_USER);

        this.taonSessionApiService
          .createUser(form.controls.email.value!, form.controls.password.value!)
          .pipe(
            take(1),

            tap(user => {
              if (user) {
                loginAction();
              } else {
                this.state.set(TaonSessionState.ENTER_REGISTRATION_PASSWORDS);
              }
            }),

            catchError(err => {
              this.state.set(TaonSessionState.ENTER_REGISTRATION_PASSWORDS);

              return NEVER;
            }),
          )
          .subscribe();

        return;

      //#endregion

      //#region ENTER_PASSWORD

      case TaonSessionState.ENTER_PASSWORD:
        loginAction();
        return;

      //#endregion

      default:
        break;
    }

    //#endregion
  }

  public logout(successCallback?: () => void): void {
    this.state.set(TaonSessionState.LOADING_LOGOUT_INFO);

    //#region @browser

    this.taonSessionApiService
      .logout()
      .pipe(
        take(1),

        tap(logoutOk => {
          if (logoutOk) {
            this.state.set(TaonSessionState.LOGIN_OR_REGISTER);
            successCallback?.();
          } else {
            this.state.set(TaonSessionState.LOGIN_SUCCESS);
          }
        }),

        finalize(() => {
          this.refresh();
        }),
      )
      .subscribe();

    //#endregion
  }

  /**
   * Reload complete authentication/session state.
   *
   * This causes:
   *
   * getCurrentUserId()
   *   -> userId$
   *   -> isLoggedIn$
   *   -> context$
   */
  public refresh(): void {
    this.refreshSrc.next(void 0);
  }

  /**
   * Reload authorization context only.
   *
   * Does NOT call getCurrentUserId().
   */
  public refreshContext(): void {
    this.contextRefreshSrc.next(void 0);
  }
}
