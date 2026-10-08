//#region imports
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  forwardRef,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';

import { TaonGroupApiService } from '../../taon-group/taon-group-api.service';
import { TaonGroupChooserComponent } from '../../taon-group/taon-group-chooser/taon-group-chooser.component';
import type { TaonGroupEntity } from '../../taon-group/taon-group.entity';
import { TaonProfilePictureComponent } from '../../taon-session/taon-profile/taon-profile-picture/taon-profile-picture.component';
import { TaonBackofficeNavigationService } from '../../taon-session/taon-session-backoffice/taon-backoffice-navigation.service';
import { TaonSessionApiService } from '../../taon-session/taon-session.api.service';
import type { TaonSessionUserEntity } from '../taon-session-user.entity';

import { TaonSessionBackofficeUsersModels } from './taon-session-backoffice-users.models';
import { of } from 'rxjs';
//#endregion

@Component({
  selector: 'taon-session-user-details',
  templateUrl: './taon-session-user-details.component.html',
  styleUrls: ['./taon-session-backoffice-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    TaonDatatableComponent,
    TaonGroupChooserComponent,
    TaonProfilePictureComponent,
  ],
  providers: [
    TaonGroupApiService,
    TaonBackofficeNavigationService,
    forwardRef(() => TaonSessionApiService),
  ],
})
export class TaonSessionUserDetailsComponent implements OnChanges {
  @Input({ required: true }) user!: TaonSessionUserEntity;

  readonly navigation = inject(TaonBackofficeNavigationService);

  readonly taonSessionApiService = inject(TaonSessionApiService);

  context$ = this.taonSessionApiService.context();

  ngOnChanges(): void {
    void this.loadGroupsForUser(Number(this.user.id));
  }
  //#region inject

  private readonly taonGroupApiService = inject(TaonGroupApiService);

  //#endregion

  //#region state

  readonly groupRowsByUserId = signal<
    Record<number, TaonSessionBackofficeUsersModels.AssignedGroupRow[]>
  >({});

  readonly groupChooserUserId = signal<number | undefined>(undefined);

  /**
   * Stable reference, so that nested datatables do not reload on every
   * change detection cycle while groups are not loaded yet.
   */
  private readonly emptyGroupRows: TaonSessionBackofficeUsersModels.AssignedGroupRow[] =
    [];

  private readonly emptyIds: number[] = [];

  private readonly assignedGroupIdsByUserId = signal<Record<number, number[]>>(
    {},
  );

  //#endregion

  //#region columns

  identityColumns: MtxGridColumn[] = [
    {
      header: 'Provider',
      field: 'provider',
    },
    {
      header: 'Email',
      field: 'email',
    },
  ];

  groupColumns: MtxGridColumn[] = [
    {
      header: 'ID',
      field: 'groupId',
      showExpand: true,
    },
    {
      header: 'Name',
      field: 'name',
    },
    {
      header: 'Code',
      field: 'code',
    },
    {
      header: 'Description',
      field: 'description',
    },
    {
      header: 'Actions',
      field: 'actions',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'open_in_new',
          tooltip: 'Group details',
          click: (row: TaonSessionBackofficeUsersModels.AssignedGroupRow) =>
            this.navigation.openDetails('group', row.groupId),
        },
        {
          type: 'icon',
          icon: 'delete',
          color: 'warn',
          tooltip: 'Remove group from user',
          click: (row: TaonSessionBackofficeUsersModels.AssignedGroupRow) =>
            void this.unassignGroup(row),
        },
      ],
    },
  ];

  //#endregion

  //#region methods

  groupRowsFor(
    userId: number,
  ): TaonSessionBackofficeUsersModels.AssignedGroupRow[] {
    return this.groupRowsByUserId()[userId] ?? this.emptyGroupRows;
  }

  assignedGroupIds(userId: number): number[] {
    return this.assignedGroupIdsByUserId()[userId] ?? this.emptyIds;
  }

  openGroupChooser(userId: number): void {
    this.groupChooserUserId.set(userId);
  }

  closeGroupChooser(): void {
    this.groupChooserUserId.set(undefined);
  }

  groupAssigned(userId: number): void {
    this.closeGroupChooser();

    void this.loadGroupsForUser(userId);
  }

  async loadGroupsForUser(userId: number): Promise<void> {
    if (!userId) {
      return;
    }

    const groups = await this.taonGroupApiService.getGroupsForUser(userId);

    const rows = groups.map(group => ({
      userId,
      groupId: group.id as number,
      name: group.name,
      code: group.code,
      description: group.description,
      roles: this.roleRowsFromGroup(group),
    }));

    this.groupRowsByUserId.set({
      ...this.groupRowsByUserId(),
      [userId]: rows,
    });

    this.assignedGroupIdsByUserId.set({
      ...this.assignedGroupIdsByUserId(),
      [userId]: rows.map(row => row.groupId),
    });
  }

  async unassignGroup(
    row: TaonSessionBackofficeUsersModels.AssignedGroupRow,
  ): Promise<void> {
    await this.taonGroupApiService.unassignGroupFromUser(
      row.userId,
      row.groupId,
    );

    await this.loadGroupsForUser(row.userId);
  }

  //#endregion

  //#region private methods

  private roleRowsFromGroup(
    group: TaonGroupEntity,
  ): TaonSessionBackofficeUsersModels.AssignedGroupRoleRow[] {
    const rolesById = new Map<
      number,
      TaonSessionBackofficeUsersModels.AssignedGroupRoleRow
    >();

    for (const groupRole of group.groupRoles ?? []) {
      const role = groupRole.role;
      if (role) {
        rolesById.set(Number(role.id), {
          roleId: Number(role.id),
          name: role.name,
        });
      }
    }

    return [...rolesById.values()];
  }

  //#endregion
}
