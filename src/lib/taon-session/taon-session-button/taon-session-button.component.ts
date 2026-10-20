//#region imports
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  Input,
  OnInit,
  output,
  OnDestroy,
  computed,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterOutlet } from '@angular/router';
import { Translation } from '@taon-dev/i18n/src';
import { TaonConfirmDialogComponent } from '@taon-dev/ui/src';
import { walk } from 'lodash-walk-object/src';
import { Subscription, take } from 'rxjs';
import { Taon } from 'taon/src';
import { _, UtilsBrowser } from 'tnp-core/src';

import { TaonAuthContextEntity } from '../../taon-auth-context/taon-auth-context.entity';
import { TaonSessionComponent } from '../taon-session/taon-session.component';
import { TaonSessionApiService } from '../taon-session.api.service';
import { TaonSessionConfigService } from '../taon-session.config.service';
import {
  TaonSessionAndSessionButtonCommon,
  TaonSessionState,
} from '../taon-session.models';
import { TaonSessionConfig } from '../taon-session.provider';
import { TaonSessionStateService } from '../taon-session.state.service';

// import { toSignal } from '@angular/core/rxjs-interop';

//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-session-button',
  templateUrl: './taon-session-button.component.html',
  styleUrls: ['./taon-session-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    forwardRef(() => TaonSessionApiService),
    TaonSessionStateService,
    TaonSessionConfigService,
  ],
  imports: [
    AsyncPipe,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatSnackBarModule,
  ],
})
export class TaonSessionButtonComponent implements OnInit, OnDestroy {
  readonly t = t.for(this);

  private readonly snackBar = inject(MatSnackBar);

  showLabels = input(true);

  username = computed(() => {
    const context = this.taonSessionStateService.context();
    if (!context) {
      return ' - ';
    }
    return context.user?.username || _.first(context?.user?.identities)?.email;
  });

  //#region fields & getters

  TaonSessionState = TaonSessionState;

  protected readonly taonSessionStateService = inject(TaonSessionStateService);

  protected readonly taonSessionConfigService = inject(
    TaonSessionConfigService,
  );

  @Input()
  config: TaonSessionConfig;

  private readonly dialog = inject(MatDialog);

  private readonly router = inject(Router);

  protected sub = new Subscription();

  public readonly context = output<TaonAuthContextEntity>();

  //#endregion

  constructor() {
    this.taonSessionStateService.activate({
      from: 'taon-session-button',
    });
  }

  //#region methods / open login dialog

  open(state?: TaonSessionState): void {
    if (
      UtilsBrowser.isRunningOnMobileDevice &&
      UtilsBrowser.isEmbeddedBrowser
    ) {
      const ref = this.dialog.open(TaonConfirmDialogComponent, {
        width: '376px',
        data: {
          title: this.t.gettext('Unsupported browser'),
          message: this.t.gettext(
            'Login is not supported in the embedded browser. Copy the link and open it in Safari or Chrome.',
          ),
          confirmText: this.t.gettext('Copy link'),
          cancelText: this.t.gettext('Cancel'),
        },
      });

      ref.afterClosed().subscribe(async confirmed => {
        if (!confirmed) {
          return;
        }

        await navigator.clipboard.writeText(window.location.href);

        this.snackBar.open(
          this.t.gettext(
            'Link copied. Open Safari or Chrome and paste it there.',
          ),
          this.t.gettext('OK'),
          {
            duration: 5000,
          },
        );
      });
    } else {
      const instance = this.dialog.open(TaonSessionComponent, {
        width: '410px',
        data: {
          activeSessionInstanceId:
            this.taonSessionStateService.active.instanceId,
        } as TaonSessionAndSessionButtonCommon,
        autoFocus: true,
      });
      const classInstance = instance.componentInstance;
      classInstance.config = this.config;

      if (state === TaonSessionState.PROFILE_INFO) {
        this.taonSessionStateService.executeActionForState(classInstance.form);
      }
    }
  }
  //#endregion

  //#region go to dashboard
  goDashboard(): void {
    if (this.config.login.linkToDashboard) {
      void this.router.navigateByUrl(this.config.login.linkToDashboard);
    }
  }
  //#endregion

  //#region hooks / ngOnInit
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

    if (
      this.config.socialLogin.microsoft.enabled &&
      !this.config.socialLogin.microsoft.microsoftClientId
    ) {
      console.warn(
        '[taon-session-button] Microsoft client id missing [microsoftClientId]',
      );
    }
    if (
      this.config.socialLogin.google.enabled &&
      !this.config.socialLogin.google.googleClientId
    ) {
      console.warn(
        '[taon-session-button] Google client id missing [googleClientId]',
      );
    }
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // console.log('this.displayDashboardButton', this.displayDashboardButton);
    this.config.login.displayDashboardButton = _.isBoolean(
      this.config.login.displayDashboardButton,
    )
      ? this.config.login.displayDashboardButton
      : true;

    this.sub.add(
      this.taonSessionStateService.context$.subscribe(context => {
        this.context.emit(context);
      }),
    );

    this.taonSessionStateService.refreshContext();
  }
  //#endregion

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.taonSessionStateService.deactivate();
  }
}
