import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
} from '@angular/core';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';

import { TaonBackofficeNavigationService } from '../../taon-session/taon-session-backoffice/taon-backoffice-navigation.service';
import { TaonSessionUserApiService } from '../taon-session-user-api.service';
import type { TaonSessionUserEntity } from '../taon-session-user.entity';

import { TaonSessionUserDetailsComponent } from './taon-session-user-details.component';

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
  readonly userApiService = inject(TaonSessionUserApiService);

  readonly navigation = inject(TaonBackofficeNavigationService);

  public get crud() {
    return this.userApiService.taonSessionUserController;
  }

  readonly columns: MtxGridColumn[] = [
    { header: 'ID', field: 'id', sortable: true, showExpand: true },
    { header: 'Username', field: 'username', sortable: true },
    {
      header: 'Actions',
      field: 'actions',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'open_in_new',
          tooltip: 'User details',
          click: (user: TaonSessionUserEntity) =>
            this.navigation.openDetails('user', user.id),
        },
      ],
    },
  ];

  add(): void {}
}
