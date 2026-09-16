//#region imports
import { AsyncPipe, CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterOutlet } from '@angular/router';
import { walk } from 'lodash-walk-object/src';
import { _ } from 'tnp-core/src';

import { TaonSessionComponent } from '../taon-session/taon-session.component';
import { TaonSessionApiService } from '../taon-session-api.service';
import {
  TaonSessionConfig,
  TaonSessionProvider,
} from '../taon-session.provider';
import { TaonSessionStateService } from '../taon-session.state.service';

//#endregion

@Component({
  selector: 'taon-session-button',
  templateUrl: './taon-session-button.component.html',
  styleUrls: ['./taon-session-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TaonSessionApiService,
    TaonSessionStateService,
    TaonSessionProvider,
  ],
  imports: [
    AsyncPipe,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    CommonModule,
  ],
})
export class TaonSessionButtonComponent implements OnInit {
  //#region fields & getters

  protected readonly taonSessionStateService = inject(TaonSessionStateService);

  protected readonly taonSessionProvider = inject(TaonSessionProvider);

  @Input()
  config: TaonSessionConfig;

  private readonly dialog = inject(MatDialog);

  private readonly router = inject(Router);

  private readonly injector = inject(Injector);

  //#endregion

  constructor() {}

  //#region methods / open login dialog

  openLogin(): void {
    const instance = this.dialog.open(TaonSessionComponent, {
      width: '410px',
      data: null,
      autoFocus: true,
    }).componentInstance;
    instance.config = this.config;
  }
  //#endregion

  //#region go to dashboard
  goDashboard(): void {
    if (this.config.login.linkToDashboard) {
      void this.router.navigateByUrl(this.config.login.linkToDashboard);
    }
  }
  //#endregion

  //#region logout
  logout(): void {
    this.taonSessionStateService.logout();
  }
  //#endregion

  //#region hooks / ngOnInit
  ngOnInit(): void {
    const config = this.taonSessionProvider.clone();
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
  }
  //#endregion
}
