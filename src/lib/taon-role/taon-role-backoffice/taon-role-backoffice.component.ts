//#region imports
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonRoleApiService } from '@taon-dev/session/src';
import { TaonGroupApiService } from '@taon-dev/session/src';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
//#endregion

@Component({
  selector: 'app-taon-role-backoffice',
  templateUrl: './taon-role-backoffice.component.html',
  styleUrls: ['./taon-role-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterOutlet, TaonDatatableComponent],
  providers: [TaonRoleApiService],
})
export class TaonRoleBackofficeComponent {
  taonRoleApiService = inject(TaonRoleApiService);

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get crud() {
    return this.taonRoleApiService.taonRoleController;
  }

  columns: MtxGridColumn[] = [
    {
      header: 'ID',
      field: 'id',
      sortable: true,
    },
    {
      header: 'Name',
      field: 'name',
      sortable: true,
    },
    {
      header: 'Code',
      field: 'code',
      sortable: true,
    },
  ];

  add() {}
}
