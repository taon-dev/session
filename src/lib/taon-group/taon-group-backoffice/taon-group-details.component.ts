//#region imports
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonRoleChooserComponent } from '../../taon-role/taon-role-chooser/taon-role-chooser.component';
import { TaonBackofficeNavigationService } from '../../taon-session/taon-session-backoffice/taon-backoffice-navigation.service';
import { TaonGroupApiService } from '../taon-group-api.service';
import type { TaonGroupEntity } from '../taon-group.entity';

import { TaonGroupBackofficeModels } from './taon-group-backoffice.models';
//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-group-details',
  templateUrl: './taon-group-details.component.html',
  styleUrls: ['./taon-group-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    TaonDatatableComponent,
    TaonRoleChooserComponent,
  ],
  providers: [TaonGroupApiService, TaonBackofficeNavigationService],
})
export class TaonGroupDetailsComponent implements OnChanges {
  readonly t = t.for(this);

  @Input({ required: true }) group!: TaonGroupEntity;

  readonly navigation = inject(TaonBackofficeNavigationService);

  ngOnChanges(): void {
    void this.loadRolesForGroup(Number(this.group.id));
  }
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
  protected readonly emptyRoleRows: TaonGroupBackofficeModels.AssignedRoleRow[] =
    [];

  protected readonly emptyIds: number[] = [];

  protected readonly assignedRoleIdsByGroupId = signal<Record<number, number[]>>(
    {},
  );

  //#endregion

  //#region columns

  roleColumns: MtxGridColumn[] = [
    {
      header: this.t.gettext('ID'),
      field: 'roleId',
    },
    {
      header: this.t.gettext('Name'),
      field: 'name',
    },
    {
      header: this.t.gettext('Code'),
      field: 'code',
    },
    {
      header: this.t.gettext('Description'),
      field: 'description',
    },
    {
      header: this.t.gettext('Actions'),
      field: 'actions',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'open_in_new',
          tooltip: this.t.gettext('Role details'),
          click: (row: TaonGroupBackofficeModels.AssignedRoleRow) =>
            this.navigation.openDetails('role', row.roleId),
        },
        {
          type: 'icon',
          icon: 'delete',
          color: 'warn',
          tooltip: this.t.gettext('Remove role from group'),
          click: (row: TaonGroupBackofficeModels.AssignedRoleRow) =>
            void this.unassignRole(row),
        },
      ],
    },
  ];

  //#endregion

  //#region methods

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

  //#endregion
}
