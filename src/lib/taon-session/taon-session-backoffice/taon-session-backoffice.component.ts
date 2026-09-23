//#region imports
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterOutlet } from '@angular/router';

//#endregion

@Component({
  selector: 'app-taon-session-backoffice',
  templateUrl: './taon-session-backoffice.component.html',
  styleUrls: ['./taon-session-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterOutlet],
})
export class TaonSessionBackofficeComponent {}
