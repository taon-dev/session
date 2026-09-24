//#region imports
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';

import { TaonSessionUserApiService } from '../taon-session-user-api.service';
//#endregion

@Component({
  selector: 'app-taon-session-backoffice-users',
  templateUrl: './taon-session-backoffice-users.component.html',
  styleUrls: ['./taon-session-backoffice-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterOutlet, TaonDatatableComponent],
  providers: [TaonSessionUserApiService],
})
export class TaonSessionBackofficeUsersComponent {
  userApiService = inject(TaonSessionUserApiService);

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get crud() {
    return this.userApiService.taonSessionUserController;
  }

  columns: MtxGridColumn[] = [
    {
      header: 'ID',
      field: 'id',
      sortable: true,
    },
    {
      header: 'Email',
      field: 'email',
      sortable: true,
    },
  ];

  add() {}
}
