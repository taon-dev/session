//#region imports
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonBackofficeNavigationService } from './taon-backoffice-navigation.service';
import { TaonSessionBackofficeApiService } from './taon-session-backoffice.api.service';
import { TaonSessionBackofficeModels } from './taon-session-backoffice.models';
import { TaonSessionDetailsComponent } from './taon-session-details.component';

//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'app-taon-session-backoffice',
  templateUrl: './taon-session-backoffice.component.html',
  styleUrls: ['./taon-session-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaonDatatableComponent, TaonSessionDetailsComponent],
  providers: [
    TaonSessionBackofficeApiService,
    TaonBackofficeNavigationService,
  ],
})
export class TaonSessionBackofficeComponent {
  readonly t = t.for(this);

  readonly taonSessionBackofficeApiService = inject(TaonSessionBackofficeApiService);

  readonly taonBackofficeNavigationService = inject(TaonBackofficeNavigationService);

  public get crud() {
    return this.taonSessionBackofficeApiService.taonSessionBackofficeController;
  }

  readonly columns: MtxGridColumn[] = [
    { header: this.t.gettext('User ID'), field: 'userId', sortable: true, showExpand: true },
    { header: this.t.gettext('Device'), field: 'deviceName', sortable: true },
    { header: this.t.gettext('IP'), field: 'ip', sortable: true },
    {
      header: this.t.gettext('Actions'),
      field: 'actions',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'open_in_new',
          tooltip: this.t.gettext('Session details'),
          click: (session: TaonSessionBackofficeModels.SessionRow) =>
            this.taonBackofficeNavigationService.openDetails('session', session.id),
        },
      ],
    },
  ];
}
