//#region imports

import { computed, inject, Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Level, Log } from 'ng2-logger/src';
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
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { Taon, TaonBaseProvider, TaonProvider } from 'taon/src';
import { TaonStateMachine } from 'tnp-core/src';

import { TaonAuthContextEntity } from '../taon-auth-context/taon-auth-context.entity';
import { TaonSessionUserUtils } from '../taon-session-user/taon-session-user.utils';

import type { TaonSessionComponent } from './taon-session/taon-session.component';
import { TaonSessionApiService } from './taon-session.api.service';
import { TaonSessionConfigService } from './taon-session.config.service';
import {
  TaonErorsMap,
  TaonLoginErrors,
  TaonSessionState,
} from './taon-session.models';

//#endregion

const log = Log.create(Taon.__FILE_RELATIVE_PATH, Level.ERROR);

const intitialState = TaonSessionState.LOADING_INITIAL_AUTH_INFO;

class TaonSessionStateInstance {
  //#region fields & getters

  inited = false;

  //#region fields & getters / instace id
  readonly instanceId = TaonSessionUserUtils.randomUUID();

  //#endregion

  //#region fields & getters / refresh src
  /**
   * Refreshes session/authentication information.
   *
   * This causes getCurrentUserId() to be called again.
   */
  protected readonly refreshSrc = new BehaviorSubject<void>(void 0);
  //#endregion

  //#region fields & getters / context refresh src
  /**
   * Refreshes authorization context without reloading
   * the current session/user.
   *
   * Useful when roles/groups/permissions change while
   * the currently authenticated user stays the same.
   */
  protected readonly contextRefreshSrc = new BehaviorSubject<void>(void 0);
  //#endregion

  //#region fields & getters / user id
  protected readonly userId = signal<number | undefined>(void 0);
  //#endregion

  //#region fields & getters / current slide
  protected readonly currentSlide = signal(intitialState);
  //#endregion

  //#region fields & getters / allowed state map
  private allowedStateMap = new Map<TaonSessionState, TaonSessionState[]>([
    [
      TaonSessionState.LOADING_INITIAL_AUTH_INFO,
      [
        TaonSessionState.LOGIN_OR_REGISTER,
        TaonSessionState.LOGIN_SUCCESS,
        TaonSessionState.PROFILE_INFO,
      ],
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
        TaonSessionState.LOGIN_OR_REGISTER,
      ],
    ],
    [
      TaonSessionState.PROFILE_INFO,
      [
        TaonSessionState.LOGIN_SUCCESS,
        TaonSessionState.LOADING_LOGOUT_INFO,
        TaonSessionState.ENTER_PASSWORD,
        TaonSessionState.LOGIN_OR_REGISTER,
      ],
    ],
    [
      TaonSessionState.LOADING_LOGOUT_INFO,
      [TaonSessionState.LOGIN_OR_REGISTER, TaonSessionState.LOGIN_SUCCESS],
    ],
  ]);
  //#endregion

  //#region fields & getters / state
  public state = new TaonStateMachine<TaonSessionState>({
    defaultValue: this.currentSlide(),
    allowedStateMap: this.allowedStateMap,
    // debugMode: true,
    effect: (nextState, previousState, debugMode) => {
      log.info('states', {
        nextState,
        previousState,
      });
      this.currentSlide.set(nextState);
    },
  });
  //#endregion

  //#region fields & getters / user id
  /**
   * Current authenticated user.
   *
   * Shared because multiple consumers may depend on userId$,
   * isLoggedIn$ and context$ at the same time.
   *
   * One refresh => one getCurrentUserId() request.
   */
  public readonly userId$ = this.refreshSrc.pipe(
    switchMap(() => {
      //#region @backend
      return of(1000000);
      //#endregion

      //#region @browser
      return this.taonSessionApiService.getCurrentUserId().pipe(
        catchError(err => {
          // console.log('error 1', err);
          this.state.set(TaonSessionState.LOGIN_OR_REGISTER);
          return of(void 0);
        }),
      );
      //#endregion
    }),

    tap(userId => {
      // console.log('userid', { userId });
      this.userId.set(userId);

      if (userId) {
        this.state.set(TaonSessionState.PROFILE_INFO);
      } else {
        this.state.set(TaonSessionState.LOGIN_OR_REGISTER);
      }
    }),

    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );
  //#endregion

  //#region fields & getters / is logged in
  /**
   * Projection of userId$.
   *
   * Does NOT cause another getCurrentUserId() call because
   * userId$ is shared.
   */
  public readonly isLoggedIn$ = this.userId$.pipe(map(userId => !!userId));
  //#endregion

  //#region fields & getters / context
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

  //#region fields & getters / taon sessin api service
  protected get taonSessionApiService(): TaonSessionApiService {
    return this.taonSessionStateService.taonSessionApiService;
  }
  //#endregion

  //#region fields & getters / taon sessin api service
  protected get taonSessionConfigService(): TaonSessionConfigService {
    return this.taonSessionStateService.taonSessionConfigService;
  }
  //#endregion

  //#endregion

  //#region constructor
  constructor(private taonSessionStateService: TaonSessionStateService) {}
  //#endregion

  //#region API / execute action for state

  public executeActionForState(form: TaonSessionComponent['form']): void {
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

    // console.log(`action for ${this.state.currentValue}`);
    switch (this.state.currentValue) {
      // this is done automatically when subscribed
      // case TaonSessionState.LOADING_INITIAL_AUTH_INFO:
      //   this.refresh();
      //   return;

      //#region PROFILE_INFO
      case TaonSessionState.PROFILE_INFO:
        this.refresh();
        return;
      //#endregion

      //#region LOGIN_SUCCESS
      case TaonSessionState.LOGIN_SUCCESS:
        this.state.set(TaonSessionState.PROFILE_INFO);

        // setTimeout(() => { // TODO @LAST refresh token or logout
        //   this.refresh();
        // }, this.taonSessionConfigService.clone().cookies.ACCESS_TOKEN_EXPIRES_IN_SECONDS * 1000);
        return;
      //#endregion

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
  }
  //#endregion

  //#region API / logout
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
  //#endregion

  //#region API / refresh
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
  //#endregion

  //#region API / refresh context
  /**
   * Reload authorization context only.
   *
   * Does NOT call getCurrentUserId().
   */
  public refreshContext(): void {
    this.contextRefreshSrc.next(void 0);
  }
  //#endregion
}

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

  public readonly taonSessionApiService = inject(TaonSessionApiService);

  public readonly taonSessionConfigService = inject(TaonSessionConfigService);

  private dummyHook = {};

  private static readonly instances = new Map<
    string,
    TaonSessionStateInstance
  >();

  readonly currentStateSrc = new BehaviorSubject<{
    currentState: TaonSessionState;
    previousState: TaonSessionState;
  }>({
    currentState: intitialState,
    previousState: intitialState,
  });

  readonly currentState$ = this.currentStateSrc.asObservable();

  readonly userId = signal<number | undefined>(undefined);

  readonly context = signal<TaonAuthContextEntity | undefined>(undefined);

  readonly isLoggedIn = computed(() => !!this.userId());

  readonly userId$ = toObservable(this.userId);

  readonly context$ = toObservable(this.context);

  readonly isLoggedIn$ = toObservable(this.isLoggedIn);

  public readonly active?: TaonSessionStateInstance;

  private activeSubscriptions = new Subscription();
  //#endregion

  //#region method / get or create instanece
  private getOrCreateInstance(hash?: string): TaonSessionStateInstance {
    if (!!hash && TaonSessionStateService.instances.has(hash)) {
      return TaonSessionStateService.instances.get(hash) as any;
    }
    const newInstance = new TaonSessionStateInstance(this);
    log.warn('creating insntace!', { newInstance });
    TaonSessionStateService.instances.set(newInstance.instanceId, newInstance);
    return newInstance;
  }
  //#endregion

  //#region API / activate
  public activate(opt?: {
    hash?: string;
    from?: string;
  }): typeof this.dummyHook {
    opt = opt || {};
    log.warn(`Activate hash="${opt.hash}" from ${opt.from}`);

    const source = this.getOrCreateInstance(opt.hash);

    // @ts-expect-error
    this.active = source;

    // if (source.inited) {
    //   console.log('REUSING INSTANCE');
    this.currentStateSrc.next({
      currentState: source.state.currentValue,
      previousState: this.currentStateSrc.getValue().currentState,
    });
    // } else {
    this.activeSubscriptions.add(
      source.userId$.subscribe(userId => {
        this.userId.set(userId);
      }),
    );

    this.activeSubscriptions.add(
      source.context$.subscribe(context => {
        this.context.set(context);
      }),
    );

    this.activeSubscriptions.add(
      source.state.currentState$.subscribe(currentState => {
        this.currentStateSrc.next(currentState);
      }),
    );
    //   source.inited = true;
    // }

    return this.dummyHook;
  }
  //#endregion

  //#region API / deactivate
  public deactivate(): void {
    this.activeSubscriptions.unsubscribe();
    this.activeSubscriptions = new Subscription();
  }
  //#endregion

  //#region facade methods

  //#region facade methods / refresh context

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public refreshContext() {
    this.active?.refreshContext();
  }
  //#endregion

  //#region facade methods / refresh
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public refresh() {
    this.active?.refresh();
  }
  //#endregion

  //#region facade methods / logout
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public logout(successCallback?: (() => void) | undefined) {
    this.active?.logout(successCallback);
  }
  //#endregion

  //#region facade methods / execture action for state
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public executeActionForState(form: TaonSessionComponent['form']) {
    this.active?.executeActionForState(form);
  }
  //#endregion

  //#region facade methods / set state
  public setState(state: TaonSessionState): boolean {
    return this.active?.state.set(state);
  }
  //#endregion

  //#region  facade methods / current value
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get currentValue() {
    return this.active?.state?.currentValue;
  }
  //#endregion

  //#endregion
}
