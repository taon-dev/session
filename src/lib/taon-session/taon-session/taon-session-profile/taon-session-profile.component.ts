//#region imports
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
} from '@angular/core';
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
import { map } from 'rxjs';
import { Taon } from 'taon/src';

import { GoogleCodeResponse, TaonSessionConfig } from '../../../index';
// import { TaonProfilePictureComponent } from '../../../taon-session/taon-profile/taon-profile-picture/taon-profile-picture.component';
import { TaonSessionApiService } from '../../../taon-session/taon-session.api.service';
import { TaonSessionStateService } from '../../../taon-session/taon-session.state.service';
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

  readonly context$ = this.taonSessionStateService.context$;

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
  connectEmail(): void {
    // TODO open dialog/form:
    // - email
    // - password
    // - repeat password
    // - verify email
  }
  //#endregion

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
