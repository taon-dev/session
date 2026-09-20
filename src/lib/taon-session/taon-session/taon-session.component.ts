//#region imports
import { A11yModule } from '@angular/cdk/a11y';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  AfterViewInit,
  Input,
  ViewChild,
  OnInit,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterOutlet } from '@angular/router';
import { MtxLoaderModule } from '@ng-matero/extensions/loader';
import { Translation, TranslateDirective } from '@taon-dev/i18n/src';
import { walk } from 'lodash-walk-object/src';
import { Subscription, take } from 'rxjs';
import { Taon } from 'taon/src';
import {
  TaonSlideContentContentChildComponent,
  TaonSlideContentComponent,
} from 'taon-ui/src';
import { _ } from 'tnp-core/src';

import { TaonSessionApiService } from '../taon-session.api.service';
import { TaonSessionConfigService } from '../taon-session.config.service';
import {
  GoogleCodeResponse,
  TaonErorsMap,
  TaonLoginErrors,
  TaonSessionState,
} from '../taon-session.models';
import {
  TaonSessionConfig,
  TaonSessionProvider,
} from '../taon-session.provider';
import { TaonSessionStateService } from '../taon-session.state.service';
import { TaonSessionValidator } from '../taon-session.validators';

import { GoogleLoginRegisterButtonComponent } from './social-buttons/google-login-register-button.component';
//#endregion

declare const google: any;

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-session',
  templateUrl: './taon-session.component.html',
  styleUrls: ['./taon-session.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TaonSessionApiService,
    TaonSessionStateService,
    TaonSessionProvider,
    TaonSessionConfigService,
    MatIconModule,
  ],
  imports: [
    //#region imports
    AsyncPipe,
    RouterOutlet,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MtxLoaderModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateDirective,
    TaonSlideContentComponent,
    TaonSlideContentContentChildComponent,
    A11yModule,
    GoogleLoginRegisterButtonComponent,
    //#endregion
  ],
})
export class TaonSessionComponent implements AfterViewInit, OnInit, OnDestroy {
  //#region fields & getters

  @Input()
  public config: TaonSessionConfig;

  @ViewChild('emailInput')
  private emailInput?: ElementRef<HTMLInputElement>;

  @ViewChild('passwordInput')
  private passwordInput?: ElementRef<HTMLInputElement>;

  @ViewChild('registrationPasswordInput')
  private registrationPasswordInput?: ElementRef<HTMLInputElement>;

  @ViewChild('slide')
  protected slide!: TaonSlideContentComponent;

  protected readonly t = t.for(this);

  protected readonly TaonSessionState = TaonSessionState;

  protected readonly TaonLoginErrors = TaonLoginErrors;

  protected readonly TaonErorsMap = TaonErorsMap;

  protected emailRegex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

  public taonSessionStateService: TaonSessionStateService = inject(
    TaonSessionStateService,
  );

  protected readonly taonSessionConfigService: TaonSessionConfigService =
    inject(TaonSessionConfigService);

  protected form = new FormGroup(
    {
      email: new FormControl('', []),
      password: new FormControl('', []),
      passwordRepeat: new FormControl('', []),
      googleCode: new FormControl('', []),
      state: new FormControl(
        this.taonSessionStateService.state.currentValue,
        [],
      ),
    },
    {
      validators: [TaonSessionValidator.passwordMatchValidator],
    },
  );

  protected readonly dialogRef = inject(MatDialogRef<TaonSessionComponent>, {
    optional: true,
  });

  isLoggedIn$ = this.taonSessionStateService.isLoggedIn$;

  protected sub = new Subscription();

  protected googleButtonLoaded = false;

  public whenAllowedAnimationMap = new Map<
    TaonSessionState,
    TaonSessionState[]
  >([
    [
      TaonSessionState.LOGIN_OR_REGISTER,
      [
        TaonSessionState.ENTER_PASSWORD,
        TaonSessionState.ENTER_REGISTRATION_PASSWORDS,
        TaonSessionState.LOADING_AUTH,
      ],
    ],
    [TaonSessionState.LOADING_AUTH, [TaonSessionState.LOGIN_SUCCESS]],
  ]);

  public get isInsideDialog(): boolean {
    return !!this.dialogRef;
  }

  get googleClientId(): string {
    return this.config.socialLogin.google.googleClientId;
  }

  get microsoftClientId(): string {
    return this.config.socialLogin.microsoft.microsoftClientId;
  }

  get isAnySocialLoginEnabled(): boolean {
    return this.config.socialLogin.isAnySocialLoginEnabled;
  }

  get diableLoginByEmail(): boolean {
    return this.config.login.diableLoginByEmail;
  }

  //#endregion

  //#region reload me
  public reloadMe(): void {
    this.taonSessionStateService.refresh();
  }
  //#endregion

  //#region execute action for state
  public executeActionForState(): void {
    this.taonSessionStateService.executeActionForState(this.form);
  }
  //#endregion

  //#region goto
  public goTo(action: TaonSessionState): void {
    this.taonSessionStateService.state.set(action);
  }
  //#endregion

  //#region logout
  public logout(): void {
    this.taonSessionStateService.logout();
  }
  //#endregion

  //#region close
  protected close(): void {
    if (this.isInsideDialog) {
      this.dialogRef.close();
    }
  }
  //#endregion

  //#region set focus main input
  private focusMainInput(state: TaonSessionState): void {
    switch (state) {
      case TaonSessionState.LOGIN_OR_REGISTER:
        if (!this.config.socialLogin.isAnySocialLoginEnabled) {
          this.emailInput?.nativeElement.focus();
        }
        break;

      case TaonSessionState.ENTER_PASSWORD:
        this.passwordInput?.nativeElement.focus();
        break;

      case TaonSessionState.ENTER_REGISTRATION_PASSWORDS:
        this.registrationPasswordInput?.nativeElement.focus();
        break;

      // later:
      // case TaonSessionState.TWO_FA_AUTHENTICATOR:
      //   this.twoFaInput?.nativeElement.focus();
      //   break;
    }
  }
  //#endregion

  //#region google login
  private googleCodeClient?: any;

  private initGoogleLogin(): void {
    this.googleCodeClient = google.accounts.oauth2.initCodeClient({
      client_id: this.config.socialLogin.google.googleClientId,

      scope: 'openid email profile',

      ux_mode: 'popup',

      callback: async (response: GoogleCodeResponse) => {
        if (response.error) {
          console.error('[google-login]', response);
          return;
        }

        if (!response.code) {
          return;
        }

        await this.loginWithGoogleCode(response.code);
      },

      error_callback: (error: any) => {
        console.error('[google-login-popup]', error);
      },
    });
  }

  public loginWithGoogle(): void {
    this.form.controls.googleCode.setErrors({});
    if (!this.googleCodeClient) {
      this.initGoogleLogin();
    }

    this.googleCodeClient.requestCode();
  }

  private async loginWithGoogleCode(code: string): Promise<void> {
    this.form.controls.googleCode.setValue(code);
    // this.taonSessionStateService.state.set(TaonSessionState.LOADING_AUTH);
    this.form.controls.email.reset();
    this.form.controls.email.setValidators([]);
    this.form.controls.email.setErrors({});
    this.form.controls.email.updateValueAndValidity();
    this.executeActionForState();
  }
  //#endregion

  //#region hooks

  //#region hooks / on init
  ngOnInit(): void {
    const config = this.taonSessionConfigService.clone();
    walk.Object(
      this.config || {},
      (value, lodashPath) => {
        _.set(config, lodashPath, value);
      },
      {
        walkGetters: false,
      },
    );
    this.config = config;

    this.isLoggedIn$.pipe(take(1)).subscribe();
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (!this.config.login.linkToDashboard) {
      throw `Please provide config input to taon-session (or taon-session-button) component`;
    }
    if (this.config.login.defaultEmail) {
      this.form.controls.email.setValue(this.config.login.defaultEmail);
    }

    this.resetPasswordScreen();
  }
  //#endregion

  //#region hooks / on destroy
  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
  //#endregion

  //#region hooks / after view init
  ngAfterViewInit(): void {
    this.sub.add(
      this.taonSessionStateService.state.currentState$.subscribe(
        ({ currentState, previousState }) => {
          if (
            currentState === TaonSessionState.LOGIN_SUCCESS &&
            this.isInsideDialog
          ) {
            this.close();
          }
          this.form.controls.state.setValue(currentState);
          if (currentState === TaonSessionState.LOGIN_OR_REGISTER) {
            this.form.controls.googleCode.setValue('');
          }
          this.updateValidatorsFor(currentState);
          // console.log({ newState });
          if (this.slide) {
            this.slide.goTo(currentState);
            setTimeout(() => {
              // console.log(`FOCUS: ${newState}`);
              this.focusMainInput(currentState);
            }, 1000);
          }
        },
      ),
    );
  }
  //#endregion

  //#endregion

  //#region reset password field
  public resetPasswordScreen() {
    this.form.controls.password.reset();
    this.form.controls.password.setValue(
      this.config.login.defaultPassword || '',
    );
    this.form.controls.passwordRepeat.reset();
    this.form.controls.passwordRepeat.setValue(
      this.config.login.defaultPassword || '',
    );
  }
  //#endregion

  //#region update validators for
  private updateValidatorsFor(state: TaonSessionState): void {
    const { email, password, passwordRepeat } = this.form.controls;

    email.setValidators(
      state === TaonSessionState.LOGIN_OR_REGISTER &&
        !this.config?.login.diableLoginByEmail
        ? [Validators.required, Validators.pattern(this.emailRegex)]
        : [],
    );

    password.setValidators(
      state === TaonSessionState.ENTER_PASSWORD ||
        state === TaonSessionState.ENTER_REGISTRATION_PASSWORDS
        ? [Validators.required]
        : [],
    );

    passwordRepeat.setValidators(
      state === TaonSessionState.ENTER_REGISTRATION_PASSWORDS
        ? [Validators.required]
        : [],
    );

    if (!this.config?.login.diableLoginByEmail) {
      email.updateValueAndValidity();
    }

    password.updateValueAndValidity();
    passwordRepeat.updateValueAndValidity();
  }
  //#endregion
}
