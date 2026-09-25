//#region imports
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonPermissionApiService } from '@taon-dev/session/src';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
//#endregion

@Component({
  selector: 'app-taon-permission-backoffice',
  templateUrl: './taon-permission-backoffice.component.html',
  styleUrls: ['./taon-permission-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterOutlet, TaonDatatableComponent],
  providers: [TaonPermissionApiService],
})
export class TaonPermissionBackofficeComponent {
  taonPermissionApiService = inject(TaonPermissionApiService);

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get crud() {
    return this.taonPermissionApiService.taonPermissionController;
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
