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

import { TaonGroupApiService } from '../taon-group-api.service';
import type { TaonGroupEntity } from '../taon-group.entity';
//#endregion

@Component({
  selector: 'taon-group-chooser',
  templateUrl: './taon-group-chooser.component.html',
  styleUrls: ['./taon-group-chooser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
  ],
  providers: [TaonGroupApiService],
})
export class TaonGroupChooserComponent {
  //#region inject

  private readonly taonGroupApiService = inject(TaonGroupApiService);

  //#endregion

  //#region inputs & outputs

  @Input({ required: true }) userId!: number;

  @Input() excludedGroupIds: number[] = [];

  @Output() readonly assigned = new EventEmitter<number>();

  @Output() readonly cancelled = new EventEmitter<void>();

  //#endregion

  //#region state

  readonly groups = signal<TaonGroupEntity[]>([]);

  readonly loading = signal(false);

  readonly saving = signal(false);

  selectedGroupId?: number;

  //#endregion

  //#region constructor

  constructor() {
    void this.loadGroups();
  }

  //#endregion

  //#region getters

  get availableGroups(): TaonGroupEntity[] {
    return this.groups().filter(
      group => !this.excludedGroupIds.includes(group.id as number),
    );
  }

  //#endregion

  //#region methods

  async loadGroups(): Promise<void> {
    this.loading.set(true);

    try {
      this.groups.set(await this.taonGroupApiService.getAllGroups());
    } catch {
      this.groups.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  async assign(): Promise<void> {
    const groupId = this.selectedGroupId;

    if (!groupId || !this.userId) {
      return;
    }

    this.saving.set(true);

    try {
      await this.taonGroupApiService.assignGroupToUser(this.userId, groupId);

      this.selectedGroupId = undefined;

      this.assigned.emit(groupId);
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.selectedGroupId = undefined;

    this.cancelled.emit();
  }

  //#endregion
}
