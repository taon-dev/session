import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';

import { TaonBackofficeNavigationService } from '../../taon-session/taon-session-backoffice/taon-backoffice-navigation.service';
import { TaonRoleApiService } from '../taon-role-api.service';
import type { TaonRoleEntity } from '../taon-role.entity';

import { TaonRoleDetailsComponent } from './taon-role-details.component';

@Component({
  selector: 'app-taon-role-backoffice',
  templateUrl: './taon-role-backoffice.component.html',
  styleUrls: ['./taon-role-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaonDatatableComponent, TaonRoleDetailsComponent],
  providers: [TaonRoleApiService, TaonBackofficeNavigationService],
})
export class TaonRoleBackofficeComponent {
  readonly taonRoleApiService = inject(TaonRoleApiService);

  readonly navigation = inject(TaonBackofficeNavigationService);

  public get crud() {
    return this.taonRoleApiService.taonRoleController;
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
          tooltip: 'Role details',
          click: (role: TaonRoleEntity) =>
            this.navigation.openDetails('role', role.id),
        },
      ],
    },
  ];

  add(): void {}
}
