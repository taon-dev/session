//#region imports
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';

import { TaonPermissionApiService } from '../taon-permission-api.service';
import { TaonPermissionViewEditComponent } from '../taon-permission-view-edit/taon-permission-view-edit.component';
//#endregion

@Component({
  selector: 'app-taon-permission-backoffice',
  templateUrl: './taon-permission-backoffice.component.html',
  styleUrls: ['./taon-permission-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    RouterOutlet,
    TaonDatatableComponent,
    TaonPermissionViewEditComponent,
  ],
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
      showExpand: true,
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

  add(): void {}
}
