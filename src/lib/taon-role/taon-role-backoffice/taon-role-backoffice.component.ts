import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonBackofficeNavigationService } from '../../taon-session/taon-session-backoffice/taon-backoffice-navigation.service';
import { TaonRoleApiService } from '../taon-role-api.service';
import type { TaonRoleEntity } from '../taon-role.entity';

import { TaonRoleDetailsComponent } from './taon-role-details.component';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'app-taon-role-backoffice',
  templateUrl: './taon-role-backoffice.component.html',
  styleUrls: ['./taon-role-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaonDatatableComponent, TaonRoleDetailsComponent],
  providers: [TaonRoleApiService, TaonBackofficeNavigationService],
})
export class TaonRoleBackofficeComponent {
  readonly t = t.for(this);

  readonly taonRoleApiService = inject(TaonRoleApiService);

  readonly navigation = inject(TaonBackofficeNavigationService);

  public get crud() {
    return this.taonRoleApiService.taonRoleController;
  }

  readonly columns: MtxGridColumn[] = [
    { header: this.t.gettext('ID'), field: 'id', sortable: true, showExpand: true },
    { header: this.t.gettext('Name'), field: 'name', sortable: true },
    { header: this.t.gettext('Code'), field: 'code', sortable: true },
    {
      header: this.t.gettext('Actions'),
      field: 'actions',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'open_in_new',
          tooltip: this.t.gettext('Role details'),
          click: (role: TaonRoleEntity) =>
            this.navigation.openDetails('role', role.id),
        },
      ],
    },
  ];

  add(): void {}
}
