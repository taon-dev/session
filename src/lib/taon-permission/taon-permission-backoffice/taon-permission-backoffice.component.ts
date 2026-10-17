//#region imports
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonBackofficeNavigationService } from '../../taon-session/taon-session-backoffice/taon-backoffice-navigation.service';
import { TaonPermissionApiService } from '../taon-permission-api.service';
import type { TaonPermissionEntity } from '../taon-permission.entity';

import { TaonPermissionDetailsComponent } from './taon-permission-details.component';
//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'app-taon-permission-backoffice',
  templateUrl: './taon-permission-backoffice.component.html',
  styleUrls: ['./taon-permission-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TaonDatatableComponent,
    TaonPermissionDetailsComponent,
  ],
  providers: [TaonPermissionApiService, TaonBackofficeNavigationService],
})
export class TaonPermissionBackofficeComponent {
  readonly t = t.for(this);

  readonly navigation = inject(TaonBackofficeNavigationService);

  taonPermissionApiService = inject(TaonPermissionApiService);

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get crud() {
    return this.taonPermissionApiService.taonPermissionController;
  }

  columns: MtxGridColumn[] = [
    {
      header: this.t.gettext('ID'),
      field: 'id',
      sortable: true,
      showExpand: true,
    },
    {
      header: this.t.gettext('Name'),
      field: 'name',
      sortable: true,
    },
    {
      header: this.t.gettext('Code'),
      field: 'code',
      sortable: true,
    },
    {
      header: this.t.gettext('Actions'),
      field: 'actions',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'open_in_new',
          tooltip: this.t.gettext('Permission details'),
          click: (permission: TaonPermissionEntity) =>
            this.navigation.openDetails('permission', permission.id),
        },
      ],
    },
  ];

  add(): void {}
}
