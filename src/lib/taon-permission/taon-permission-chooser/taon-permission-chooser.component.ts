//#region imports
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { TaonRoleApiService } from '../../taon-role/taon-role-api.service';
import { TaonPermissionApiService } from '../taon-permission-api.service';
import type { TaonPermissionEntity } from '../taon-permission.entity';
//#endregion

@Component({
  selector: 'taon-permission-chooser',
  templateUrl: './taon-permission-chooser.component.html',
  styleUrls: ['./taon-permission-chooser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
  ],
  providers: [TaonPermissionApiService, TaonRoleApiService],
})
export class TaonPermissionChooserComponent {
  //#region inject

  private readonly taonPermissionApiService = inject(TaonPermissionApiService);

  private readonly taonRoleApiService = inject(TaonRoleApiService);

  //#endregion

  //#region inputs & outputs

  @Input({ required: true }) roleId!: number;

  @Input() excludedPermissionIds: number[] = [];

  @Output() readonly assigned = new EventEmitter<number>();

  @Output() readonly cancelled = new EventEmitter<void>();

  //#endregion

  //#region state

  readonly permissions = signal<TaonPermissionEntity[]>([]);

  readonly loading = signal(false);

  readonly saving = signal(false);

  selectedPermissionId?: number;

  //#endregion

  //#region constructor

  constructor() {
    void this.loadPermissions();
  }

  //#endregion

  //#region getters

  get availablePermissions(): TaonPermissionEntity[] {
    return this.permissions().filter(
      permission =>
        !this.excludedPermissionIds.includes(permission.id as number),
    );
  }

  //#endregion

  //#region methods

  async loadPermissions(): Promise<void> {
    this.loading.set(true);

    try {
      this.permissions.set(
        await this.taonPermissionApiService.getAllPermissions(),
      );
    } catch {
      this.permissions.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async assign(): Promise<void> {
    const permissionId = this.selectedPermissionId;

    if (!permissionId || !this.roleId) {
      return;
    }

    this.saving.set(true);

    try {
      await this.taonRoleApiService.assignPermissionToRole(
        this.roleId,
        permissionId,
      );

      this.selectedPermissionId = undefined;

      this.assigned.emit(permissionId);
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.selectedPermissionId = undefined;

    this.cancelled.emit();
  }

  //#endregion
}
