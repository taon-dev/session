//#region imports
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';

import { TaonGroupApiService } from '../../taon-group/taon-group-api.service';
import { TaonGroupChooserComponent } from '../../taon-group/taon-group-chooser/taon-group-chooser.component';
import type { TaonGroupEntity } from '../../taon-group/taon-group.entity';
import { TaonSessionUserApiService } from '../taon-session-user-api.service';

import { TaonSessionBackofficeUsersModels } from './taon-session-backoffice-users.models';
//#endregion

@Component({
  selector: 'app-taon-session-backoffice-users',
  templateUrl: './taon-session-backoffice-users.component.html',
  styleUrls: ['./taon-session-backoffice-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    TaonDatatableComponent,
    TaonGroupChooserComponent,
  ],
  providers: [TaonSessionUserApiService, TaonGroupApiService],
})
export class TaonSessionBackofficeUsersComponent {
  //#region inject

  userApiService = inject(TaonSessionUserApiService);

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

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get crud() {
    return this.userApiService.taonSessionUserController;
  }

  //#region columns

  columns: MtxGridColumn[] = [
    {
      header: 'ID',
      field: 'id',
      sortable: true,
      showExpand: true,
    },
    {
      header: 'Username',
      field: 'username',
      sortable: true,
    },
  ];

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

  userExpansionChanged(event: {
    expanded: boolean;
    data: { id: number };
  }): void {
    if (!event?.expanded) {
      return;
    }

    void this.loadGroupsForUser(event.data?.id);
  }

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
      permissions: this.permissionRowsFromGroup(group),
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

  add(): void {}

  //#endregion

  //#region private methods

  private permissionRowsFromGroup(
    group: TaonGroupEntity,
  ): TaonSessionBackofficeUsersModels.AssignedGroupPermissionRow[] {
    const permissionsById = new Map<
      number,
      TaonSessionBackofficeUsersModels.AssignedGroupPermissionRow
    >();

    for (const groupRole of group.groupRoles ?? []) {
      for (const rolePermission of groupRole.role?.rolePermissions ?? []) {
        const permission = rolePermission.permission;

        if (!permission) {
          continue;
        }

        permissionsById.set(permission.id as number, {
          permissionId: permission.id as number,
          name: permission.name,
          code: permission.code,
          description: permission.description,
        });
      }
    }

    return [...permissionsById.values()];
  }

  //#endregion
}
