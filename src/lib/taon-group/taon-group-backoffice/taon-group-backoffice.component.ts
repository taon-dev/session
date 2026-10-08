import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';

import { TaonBackofficeNavigationService } from '../../taon-session/taon-session-backoffice/taon-backoffice-navigation.service';
import { TaonGroupApiService } from '../taon-group-api.service';
import type { TaonGroupEntity } from '../taon-group.entity';

import { TaonGroupDetailsComponent } from './taon-group-details.component';

@Component({
  selector: 'app-taon-group-backoffice',
  templateUrl: './taon-group-backoffice.component.html',
  styleUrls: ['./taon-group-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaonDatatableComponent, TaonGroupDetailsComponent],
  providers: [TaonGroupApiService, TaonBackofficeNavigationService],
})
export class TaonGroupBackofficeComponent {
  readonly taonGroupApiService = inject(TaonGroupApiService);

  readonly navigation = inject(TaonBackofficeNavigationService);

  public get crud() {
    return this.taonGroupApiService.taonGroupController;
  }

  readonly columns: MtxGridColumn[] = [
    { header: 'ID', field: 'id', sortable: true, showExpand: true },
    { header: 'Name', field: 'name', sortable: true },
    { header: 'Code', field: 'code', sortable: true },
    {
      header: 'Actions',
      field: 'actions',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'open_in_new',
          tooltip: 'Group details',
          click: (group: TaonGroupEntity) =>
            this.navigation.openDetails('group', group.id),
        },
      ],
    },
  ];

  add(): void {}
}
