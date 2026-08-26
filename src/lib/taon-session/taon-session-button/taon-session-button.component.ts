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
import { _ } from 'tnp-core/src';

import { TaonSessionComponent } from '../taon-session/taon-session.component';
import { TaonSessionApiService } from '../taon-session-api.service';
import { TaonSessionStateService } from '../taon-session-state.service';
import { TaonLoginConfig } from '../taon-session.models';

//#endregion

@Component({
  selector: 'taon-session-button',
  templateUrl: './taon-session-button.component.html',
  styleUrls: ['./taon-session-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TaonSessionApiService, TaonSessionStateService],
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

  @Input({
    required: true,
  })
  config: TaonLoginConfig = {
    linkToDashboard: '/',
  };

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
    if (this.config.linkToDashboard) {
      void this.router.navigateByUrl(this.config.linkToDashboard);
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
    if (!this.config.microsoftClientId) {
      console.warn(
        '[taon-session-button] Microsoft client id missing [microsoftClientId]',
      );
    }
    if (!this.config.googleClientId) {
      console.warn(
        '[taon-session-button] Google client id missing [googleClientId]',
      );
    }
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // console.log('this.displayDashboardButton', this.displayDashboardButton);
    this.config.displayDashboardButton = _.isBoolean(
      this.config.displayDashboardButton,
    )
      ? this.config.displayDashboardButton
      : true;
  }
  //#endregion
}
