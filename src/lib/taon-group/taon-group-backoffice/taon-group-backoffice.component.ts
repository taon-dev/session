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

import { TaonRoleChooserComponent } from '../../taon-role/taon-role-chooser/taon-role-chooser.component';
import { TaonGroupApiService } from '../taon-group-api.service';

import { TaonGroupBackofficeModels } from './taon-group-backoffice.models';
//#endregion

@Component({
  selector: 'app-taon-group-backoffice',
  templateUrl: './taon-group-backoffice.component.html',
  styleUrls: ['./taon-group-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    TaonDatatableComponent,
    TaonRoleChooserComponent,
  ],
  providers: [TaonGroupApiService],
})
export class TaonGroupBackofficeComponent {
  //#region inject

  taonGroupApiService = inject(TaonGroupApiService);

  //#endregion

  //#region state

  readonly roleRowsByGroupId = signal<
    Record<number, TaonGroupBackofficeModels.AssignedRoleRow[]>
  >({});

  readonly roleChooserGroupId = signal<number | undefined>(undefined);

  /**
   * Stable reference, so that nested datatables do not reload on every
   * change detection cycle while roles are not loaded yet.
   */
  private readonly emptyRoleRows: TaonGroupBackofficeModels.AssignedRoleRow[] =
    [];

  private readonly emptyIds: number[] = [];

  private readonly assignedRoleIdsByGroupId = signal<Record<number, number[]>>(
    {},
  );

  //#endregion

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  public get crud() {
    return this.taonGroupApiService.taonGroupController;
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
      header: 'Name',
      field: 'name',
      sortable: true,
    },
    {
      header: 'Code',
      field: 'code',
      sortable: true,
    },
  ];

  roleColumns: MtxGridColumn[] = [
    {
      header: 'ID',
      field: 'roleId',
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
          tooltip: 'Remove role from group',
          click: (row: TaonGroupBackofficeModels.AssignedRoleRow) =>
            void this.unassignRole(row),
        },
      ],
    },
  ];

  //#endregion

  //#region methods

  groupExpansionChanged(event: {
    expanded: boolean;
    data: { id: number };
  }): void {
    if (!event?.expanded) {
      return;
    }

    void this.loadRolesForGroup(event.data?.id);
  }

  roleRowsFor(groupId: number): TaonGroupBackofficeModels.AssignedRoleRow[] {
    return this.roleRowsByGroupId()[groupId] ?? this.emptyRoleRows;
  }

  assignedRoleIds(groupId: number): number[] {
    return this.assignedRoleIdsByGroupId()[groupId] ?? this.emptyIds;
  }

  openRoleChooser(groupId: number): void {
    this.roleChooserGroupId.set(groupId);
  }

  closeRoleChooser(): void {
    this.roleChooserGroupId.set(undefined);
  }

  roleAssigned(groupId: number): void {
    this.closeRoleChooser();

    void this.loadRolesForGroup(groupId);
  }

  async loadRolesForGroup(groupId: number): Promise<void> {
    if (!groupId) {
      return;
    }

    const roles = await this.taonGroupApiService.getRolesForGroup(groupId);

    const rows = roles.map(role => ({
      groupId,
      roleId: role.id as number,
      name: role.name,
      code: role.code,
      description: role.description,
    }));

    this.roleRowsByGroupId.set({
      ...this.roleRowsByGroupId(),
      [groupId]: rows,
    });

    this.assignedRoleIdsByGroupId.set({
      ...this.assignedRoleIdsByGroupId(),
      [groupId]: rows.map(row => row.roleId),
    });
  }

  async unassignRole(
    row: TaonGroupBackofficeModels.AssignedRoleRow,
  ): Promise<void> {
    await this.taonGroupApiService.unassignRoleFromGroup(
      row.groupId,
      row.roleId,
    );

    await this.loadRolesForGroup(row.groupId);
  }

  add(): void {}

  //#endregion
}
