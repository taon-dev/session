import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonBackofficeNavigationService } from '../../taon-session/taon-session-backoffice/taon-backoffice-navigation.service';
import { TaonGroupApiService } from '../taon-group-api.service';
import type { TaonGroupEntity } from '../taon-group.entity';

import { TaonGroupDetailsComponent } from './taon-group-details.component';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'app-taon-group-backoffice',
  templateUrl: './taon-group-backoffice.component.html',
  styleUrls: ['./taon-group-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaonDatatableComponent, TaonGroupDetailsComponent],
  providers: [TaonGroupApiService, TaonBackofficeNavigationService],
})
export class TaonGroupBackofficeComponent {
  readonly t = t.for(this);

  readonly taonGroupApiService = inject(TaonGroupApiService);

  readonly navigation = inject(TaonBackofficeNavigationService);

  public get crud() {
    return this.taonGroupApiService.taonGroupController;
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
          tooltip: this.t.gettext('Group details'),
          click: (group: TaonGroupEntity) =>
            this.navigation.openDetails('group', group.id),
        },
      ],
    },
  ];

  add(): void {}
}
