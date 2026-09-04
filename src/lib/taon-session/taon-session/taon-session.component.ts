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
import { Subscription, take } from 'rxjs';
import { Taon } from 'taon/src';
import {
  TaonSlideContentContentChildComponent,
  TaonSlideContentComponent,
} from 'taon-ui/src';

import { TaonSessionApiService } from '../taon-session-api.service';
import {
  TaonErorsMap,
  TaonLoginConfig,
  TaonLoginErrors,
  TaonSessionState,
} from '../taon-session.models';
import { TaonSessionStateService } from '../taon-session.state.service';
import { TaonSessionValidator } from '../taon-session.validators';
//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-session',
  templateUrl: './taon-session.component.html',
  styleUrls: ['./taon-session.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TaonSessionApiService, TaonSessionStateService],
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
    //#endregion
  ],
})
export class TaonSessionComponent implements AfterViewInit, OnInit, OnDestroy {
  //#region fields & getters

  @Input({
    required: true,
  })
  public config: TaonLoginConfig;

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

  protected readonly taonSessionStateService: TaonSessionStateService = inject(
    TaonSessionStateService,
  );

  protected form = new FormGroup(
    {
      email: new FormControl('', []),
      password: new FormControl('', []),
      passwordRepeat: new FormControl('', []),
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
        this.emailInput?.nativeElement.focus();
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

  //#region hooks
  ngOnInit(): void {
    this.isLoggedIn$.pipe(take(1)).subscribe();
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (!this.config.linkToDashboard) {
      throw `Please provide config input to taon-session (or taon-session-button) component`;
    }
    if (this.config.defaultEmail) {
      this.form.controls.email.setValue(this.config.defaultEmail);
    }

    this.resetPasswordScreen();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  //#region reset password field
  public resetPasswordScreen() {
    this.form.controls.password.reset();
    this.form.controls.password.setValue(this.config.defaultPassword || '');
    this.form.controls.passwordRepeat.reset();
    this.form.controls.passwordRepeat.setValue(
      this.config.defaultPassword || '',
    );
  }
  //#endregion

  private updateValidatorsFor(state: TaonSessionState): void {
    const { email, password, passwordRepeat } = this.form.controls;

    email.setValidators(
      state === TaonSessionState.LOGIN_OR_REGISTER
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

    email.updateValueAndValidity();
    password.updateValueAndValidity();
    passwordRepeat.updateValueAndValidity();
  }

  ngAfterViewInit(): void {
    this.sub.add(
      this.taonSessionStateService.state.currentState$.subscribe(
        ({ currentState, previousState }) => {
          this.form.controls.state.setValue(currentState);
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
}
