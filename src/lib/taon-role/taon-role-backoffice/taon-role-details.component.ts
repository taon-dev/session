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

import { TaonPermissionChooserComponent } from '../../taon-permission/taon-permission-chooser/taon-permission-chooser.component';
import { TaonBackofficeNavigationService } from '../../taon-session/taon-session-backoffice/taon-backoffice-navigation.service';
import { TaonRoleApiService } from '../taon-role-api.service';
import type { TaonRoleEntity } from '../taon-role.entity';

import { TaonRoleBackofficeModels } from './taon-role-backoffice.models';
//#endregion

@Component({
  selector: 'taon-role-details',
  templateUrl: './taon-role-details.component.html',
  styleUrls: ['./taon-role-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    TaonDatatableComponent,
    TaonPermissionChooserComponent,
  ],
  providers: [TaonRoleApiService, TaonBackofficeNavigationService],
})
export class TaonRoleDetailsComponent implements OnChanges {
  @Input({ required: true }) role!: TaonRoleEntity;

  readonly navigation = inject(TaonBackofficeNavigationService);

  ngOnChanges(): void {
    void this.loadPermissionsForRole(Number(this.role.id));
  }
  //#region inject

  taonRoleApiService = inject(TaonRoleApiService);

  //#endregion

  //#region state

  readonly permissionRowsByRoleId = signal<
    Record<number, TaonRoleBackofficeModels.AssignedPermissionRow[]>
  >({});

  readonly permissionChooserRoleId = signal<number | undefined>(undefined);

  /**
   * Stable reference, so that nested datatables do not reload on every
   * change detection cycle while permissions are not loaded yet.
   */
  private readonly emptyPermissionRows: TaonRoleBackofficeModels.AssignedPermissionRow[] =
    [];

  private readonly emptyIds: number[] = [];

  private readonly assignedPermissionIdsByRoleId = signal<
    Record<number, number[]>
  >({});

  //#endregion

  //#region columns

  permissionColumns: MtxGridColumn[] = [
    {
      header: 'ID',
      field: 'permissionId',
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
          tooltip: 'Permission details',
          click: (row: TaonRoleBackofficeModels.AssignedPermissionRow) =>
            this.navigation.openDetails('permission', row.permissionId),
        },
        {
          type: 'icon',
          icon: 'delete',
          color: 'warn',
          tooltip: 'Remove permission from role',
          click: (row: TaonRoleBackofficeModels.AssignedPermissionRow) =>
            void this.unassignPermission(row),
        },
      ],
    },
  ];

  //#endregion

  //#region methods

  permissionRowsFor(
    roleId: number,
  ): TaonRoleBackofficeModels.AssignedPermissionRow[] {
    return this.permissionRowsByRoleId()[roleId] ?? this.emptyPermissionRows;
  }

  assignedPermissionIds(roleId: number): number[] {
    return this.assignedPermissionIdsByRoleId()[roleId] ?? this.emptyIds;
  }

  openPermissionChooser(roleId: number): void {
    this.permissionChooserRoleId.set(roleId);
  }

  closePermissionChooser(): void {
    this.permissionChooserRoleId.set(undefined);
  }

  permissionAssigned(roleId: number): void {
    this.closePermissionChooser();

    void this.loadPermissionsForRole(roleId);
  }

  async loadPermissionsForRole(roleId: number): Promise<void> {
    if (!roleId) {
      return;
    }

    const permissions =
      await this.taonRoleApiService.getPermissionsForRole(roleId);

    const rows = permissions.map(permission => ({
      roleId,
      permissionId: permission.id as number,
      name: permission.name,
      code: permission.code,
      description: permission.description,
    }));

    this.permissionRowsByRoleId.set({
      ...this.permissionRowsByRoleId(),
      [roleId]: rows,
    });

    this.assignedPermissionIdsByRoleId.set({
      ...this.assignedPermissionIdsByRoleId(),
      [roleId]: rows.map(row => row.permissionId),
    });
  }

  async unassignPermission(
    row: TaonRoleBackofficeModels.AssignedPermissionRow,
  ): Promise<void> {
    await this.taonRoleApiService.unassignPermissionFromRole(
      row.roleId,
      row.permissionId,
    );

    await this.loadPermissionsForRole(row.roleId);
  }

  //#endregion
}
