import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
} from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonBackofficeNavigationService } from '../../taon-session/taon-session-backoffice/taon-backoffice-navigation.service';
import { TaonSessionUserApiService } from '../taon-session-user-api.service';
import type { TaonSessionUserEntity } from '../taon-session-user.entity';

import { TaonSessionUserDetailsComponent } from './taon-session-user-details.component';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'app-taon-session-backoffice-users',
  templateUrl: './taon-session-backoffice-users.component.html',
  styleUrls: ['./taon-session-backoffice-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TaonDatatableComponent,
    forwardRef(() => TaonSessionUserDetailsComponent),
  ],
  providers: [TaonSessionUserApiService, TaonBackofficeNavigationService],
})
export class TaonSessionBackofficeUsersComponent {
  readonly t = t.for(this);

  readonly userApiService = inject(TaonSessionUserApiService);

  readonly navigation = inject(TaonBackofficeNavigationService);

  public get crud() {
    return this.userApiService.taonSessionUserController;
  }

  readonly columns: MtxGridColumn[] = [
    { header: this.t.gettext('ID'), field: 'id', sortable: true, showExpand: true },
    { header: this.t.gettext('Username'), field: 'username', sortable: true },
    {
      header: this.t.gettext('Actions'),
      field: 'actions',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'open_in_new',
          tooltip: this.t.gettext('User details'),
          click: (user: TaonSessionUserEntity) =>
            this.navigation.openDetails('user', user.id),
        },
      ],
    },
  ];

  add(): void {}
}
