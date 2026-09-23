//#region imports
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AppBackofficeRoutes } from './app-backoffice.routes';
//#endregion

@Component({
  selector: 'app-app-backoffice',
  templateUrl: './app-backoffice.component.html',
  styleUrls: ['./app-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterOutlet],
})
export class AppBackofficeComponent {
  get routes() {
    return AppBackofficeRoutes[0].children || [];
  }

  basePath = '/main';
  outlet: string = 'admin';
}
