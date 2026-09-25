//#region imports
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonGroupApiService } from '@taon-dev/session/src';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
//#endregion

@Component({
  selector: 'app-taon-group-backoffice',
  templateUrl: './taon-group-backoffice.component.html',
  styleUrls: ['./taon-group-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, RouterOutlet, TaonDatatableComponent],
  providers: [TaonGroupApiService],
})
export class TaonGroupBackofficeComponent {
  taonGroupApiService = inject(TaonGroupApiService);

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get crud() {
    return this.taonGroupApiService.taonGroupController;
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
