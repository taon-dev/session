//#region imports
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//#endregion

@Component({
  selector: 'app-taon-authorization-backoffice',
  templateUrl: './taon-authorization-backoffice.component.html',
  styleUrls: ['./taon-authorization-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterOutlet],
})
export class TaonAuthorizationBackofficeComponent {
  componentLoaded = false;

  onRouteActivate(component: any): void {
    this.componentLoaded = !!component;
  }

  onRouteDeactivate(component: any): void {
    this.componentLoaded = false;
  }
}
