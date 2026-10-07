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

import { TaonGroupApiService } from '../../taon-group/taon-group-api.service';
import { TaonRoleApiService } from '../taon-role-api.service';
import type { TaonRoleEntity } from '../taon-role.entity';
//#endregion

@Component({
  selector: 'taon-role-chooser',
  templateUrl: './taon-role-chooser.component.html',
  styleUrls: ['./taon-role-chooser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
  ],
  providers: [TaonRoleApiService, TaonGroupApiService],
})
export class TaonRoleChooserComponent {
  //#region inject

  private readonly taonRoleApiService = inject(TaonRoleApiService);

  private readonly taonGroupApiService = inject(TaonGroupApiService);

  //#endregion

  //#region inputs & outputs

  @Input({ required: true }) groupId!: number;

  @Input() excludedRoleIds: number[] = [];

  @Output() readonly assigned = new EventEmitter<number>();

  @Output() readonly cancelled = new EventEmitter<void>();

  //#endregion

  //#region state

  readonly roles = signal<TaonRoleEntity[]>([]);

  readonly loading = signal(false);

  readonly saving = signal(false);

  selectedRoleId?: number;

  //#endregion

  //#region constructor

  constructor() {
    void this.loadRoles();
  }

  //#endregion

  //#region getters

  get availableRoles(): TaonRoleEntity[] {
    return this.roles().filter(
      role => !this.excludedRoleIds.includes(role.id as number),
    );
  }

  //#endregion

  //#region methods

  async loadRoles(): Promise<void> {
    this.loading.set(true);

    try {
      this.roles.set(await this.taonRoleApiService.getAllRoles());
    } catch {
      this.roles.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async assign(): Promise<void> {
    const roleId = this.selectedRoleId;

    if (!roleId || !this.groupId) {
      return;
    }

    this.saving.set(true);

    try {
      await this.taonGroupApiService.assignRoleToGroup(this.groupId, roleId);

      this.selectedRoleId = undefined;

      this.assigned.emit(roleId);
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.selectedRoleId = undefined;

    this.cancelled.emit();
  }

  //#endregion
}
