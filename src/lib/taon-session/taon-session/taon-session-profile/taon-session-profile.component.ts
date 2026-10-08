//#region imports
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterOutlet } from '@angular/router';
import { Translation } from '@taon-dev/i18n/src';
import {
  TaonConfirmDialogComponent,
  TaonHorizontalWheelScrollDirective,
} from '@taon-dev/ui/src';
import { firstValueFrom, map, shareReplay } from 'rxjs';
import { Taon } from 'taon/src';

import { GoogleCodeResponse, TaonSessionConfig } from '../../../index';
// import { TaonProfilePictureComponent } from '../../../taon-session/taon-profile/taon-profile-picture/taon-profile-picture.component';
import { TaonSessionApiService } from '../../../taon-session/taon-session.api.service';
import { TaonSessionStateService } from '../../../taon-session/taon-session.state.service';
import { TaonSessionUserEntity } from '../../../taon-session-user/taon-session-user.entity';
import { TaonSessionIdentityProvider } from '../../../taon-session-user/taon-session-user.models';

//#endregion

declare const google: any;

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-session-profile',
  templateUrl: './taon-session-profile.component.html',
  styleUrls: ['./taon-session-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    RouterOutlet,
    MatButtonModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    TaonHorizontalWheelScrollDirective,
    // TaonProfilePictureComponent,
  ],
})
export class TaonSessionProfileComponent {
  //#region fields & getters
  t = t.for(this);

  TaonSessionIdentityProvider = TaonSessionIdentityProvider;

  @Input()
  public config: TaonSessionConfig;

  protected readonly taonSessionApiService = inject(TaonSessionApiService);

  public readonly taonSessionStateService = inject(TaonSessionStateService);

  readonly context$ = this.taonSessionStateService.context$.pipe(
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  readonly usernameForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [
      Validators.required, Validators.maxLength(255), Validators.pattern(/\S/),
    ] }),
  });

  readonly passwordForm = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [
      Validators.required, Validators.minLength(8), Validators.maxLength(128),
    ] }),
    passwordRepeat: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  readonly savingUsername = signal(false);

  readonly usernameError = signal('');

  readonly usernameSaved = signal(false);

  readonly showPasswordForm = signal(false);

  readonly savingPassword = signal(false);

  readonly passwordError = signal('');

  get isVisibleGoogle(): boolean {
    return this.config?.socialLogin?.google?.enabled;
  }

  get isVisibleApple(): boolean {
    return this.config?.socialLogin?.apple?.enabled;
  }

  get isVisibleMicrosoft(): boolean {
    return this.config?.socialLogin?.microsoft?.enabled;
  }

  get isVisibleFacebook(): boolean {
    return this.config?.socialLogin?.facebook?.enabled;
  }

  get isVisibleGithub(): boolean {
    return this.config?.socialLogin?.github?.enabled;
  }

  /**
   * Email/password can be connected only when the user currently
   * has no PASSWORD identity.
   *
   * In practice this means an account created purely through
   * social authentication.
   */
  readonly canConnectEmail$ = this.context$.pipe(
    map(context => {
      const identities = context?.user?.identities || [];

      return !identities.some(
        identity => identity.provider === TaonSessionIdentityProvider.PASSWORD,
      );
    }),
  );

  readonly canConnectGoogle$ = this.context$.pipe(
    map(context => {
      const identities = context?.user?.identities || [];

      return !identities.some(
        identity => identity.provider === TaonSessionIdentityProvider.GOOGLE,
      );
    }),
  );

  readonly canConnectGithub$ = this.context$.pipe(
    map(context => {
      const identities = context?.user?.identities || [];

      return !identities.some(
        identity => identity.provider === TaonSessionIdentityProvider.GITHUB,
      );
    }),
  );

  readonly canConnectApple$ = this.context$.pipe(
    map(context => {
      const identities = context?.user?.identities || [];

      return !identities.some(
        identity => identity.provider === TaonSessionIdentityProvider.APPLE,
      );
    }),
  );

  readonly canConnectMicrosoft$ = this.context$.pipe(
    map(context => {
      const identities = context?.user?.identities || [];

      return !identities.some(
        identity => identity.provider === TaonSessionIdentityProvider.MICROSOFT,
      );
    }),
  );

  readonly canConnectFacebook$ = this.context$.pipe(
    map(context => {
      const identities = context?.user?.identities || [];

      return !identities.some(
        identity => identity.provider === TaonSessionIdentityProvider.FACEBOOK,
      );
    }),
  );

  @Output()
  readonly logout = new EventEmitter<void>();

  readonly dialog = inject(MatDialog);
  //#endregion

  onLogout(): void {
    this.logout.next();
  }

  //#region disconnect

  public disconnect(provider: TaonSessionIdentityProvider): void {
    const ref = this.dialog.open(TaonConfirmDialogComponent, {
      width: '376px',
      data: {
        title: this.t.gettext('Are you sure? '),
        message: this.t.gettext('Disconnecting provider [[ provider ]].', {
          provider,
        }),
        confirmText: this.t.gettext('OK'),
        cancelText: this.t.gettext('Cancel'),
      },
    });

    ref.afterClosed().subscribe(async confirmed => {
      if (!confirmed) return;

      this.taonSessionApiService
        .disconnectIdentity(provider)
        .subscribe(connectedToGoogle => {
          if (connectedToGoogle) {
            this.taonSessionStateService.refresh();
          }
        });
    });
  }
  //#endregion

  //#region connect email
  connectEmail(user?: TaonSessionUserEntity | null): void {
    const identity = user?.identities?.find(identity =>
      identity.isEmailVerified === true && !!identity.email,
    );
    if (!identity) {
      this.passwordError.set(this.t.gettext('Connect a sign-in method with a verified email first.'));
      return;
    }
    this.passwordForm.reset({ email: identity.email, password: '', passwordRepeat: '' });
    this.passwordError.set('');
    this.showPasswordForm.set(true);
  }
  //#endregion

  async savePassword(): Promise<void> {
    this.passwordForm.markAllAsTouched();
    this.passwordError.set('');
    if (this.passwordForm.invalid || this.savingPassword()) {
      return;
    }
    const { email, password, passwordRepeat } = this.passwordForm.getRawValue();
    if (password !== passwordRepeat) {
      this.passwordError.set(this.t.gettext('Passwords do not match each other'));
      return;
    }
    this.savingPassword.set(true);
    try {
      const connected = await firstValueFrom(this.taonSessionApiService.connectPassword(email, password));
      if (!connected) {
        this.passwordError.set(this.t.gettext('Unable to connect email/password.'));
        return;
      }
      this.passwordForm.reset();
      this.showPasswordForm.set(false);
      this.taonSessionStateService.refreshContext();
    } catch (error) {
      console.error('[connect-email]', error);
      this.passwordError.set(this.t.gettext('Unable to connect email/password. The email may already belong to another account.'));
    } finally {
      this.savingPassword.set(false);
    }
  }

  async saveUsername(): Promise<void> {
    this.usernameForm.markAllAsTouched();
    this.usernameError.set('');
    this.usernameSaved.set(false);
    if (this.usernameForm.invalid || this.savingUsername()) {
      return;
    }
    const username = this.usernameForm.controls.username.value.trim();
    this.savingUsername.set(true);
    try {
      const available = await firstValueFrom(this.taonSessionApiService.usernameAvailable(username));
      if (!available) {
        this.usernameError.set(this.t.gettext('This username is already taken.'));
        return;
      }
      const saved = await firstValueFrom(this.taonSessionApiService.changeUsername(username));
      if (!saved) {
        this.usernameError.set(this.t.gettext('Unable to update username.'));
        return;
      }
      this.usernameForm.reset();
      this.usernameSaved.set(true);
      this.taonSessionStateService.refreshContext();
    } catch (error) {
      console.error('[change-username]', error);
      this.usernameError.set(this.t.gettext('Unable to update username. It may already be taken.'));
    } finally {
      this.savingUsername.set(false);
    }
  }

  //#region connect google
  private googleCodeClient?: any;

  public connectGoogle(): void {
    if (!this.googleCodeClient) {
      this.initGoogleLogin();
    }

    this.googleCodeClient.requestCode();
  }

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

        await this.connectGoogleIdenitty(response.code);
      },

      error_callback: (error: any) => {
        console.error('[google-login-popup]', error);
      },
    });
  }

  private connectGoogleIdenitty(googleCode: string): void {
    this.taonSessionApiService
      .connectIdentity({
        googleCode,
      })
      .subscribe(connectedToGoogle => {
        if (connectedToGoogle) {
          this.taonSessionStateService.refresh();
        }
      });
  }
  //#endregion

  //#region connect apple
  connectApple(): void {
    // TODO replace with proper Apple authorization flow
    console.log('Connect Apple');
  }
  //#endregion

  //#region connect microsoft
  connectMicrosoft(): void {
    // TODO replace with proper Microsoft authorization flow
    console.log('Connect Microsoft');
  }
  //#endregion

  //#region connect facebook
  connectFacebook(): void {
    // TODO replace with proper Facebook authorization flow
    console.log('Connect Facebook');
  }
  //#endregion
}
