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
import { MatInputModule } from '@angular/material/input';

import { TaonPermissionApiService } from '../taon-permission-api.service';
import type { TaonPermissionEntity } from '../taon-permission.entity';
//#endregion

@Component({
  selector: 'taon-permission-view-edit',
  templateUrl: './taon-permission-view-edit.component.html',
  styleUrls: ['./taon-permission-view-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  providers: [TaonPermissionApiService],
})
export class TaonPermissionViewEditComponent {
  //#region inject

  private readonly taonPermissionApiService = inject(TaonPermissionApiService);

  //#endregion

  //#region inputs & outputs

  @Input({ required: true })
  set permission(value: TaonPermissionEntity) {
    this._permission = value;

    this.description.set(value?.description ?? '');

    this.editMode.set(false);
  }

  get permission(): TaonPermissionEntity {
    return this._permission;
  }

  @Output() readonly descriptionChanged = new EventEmitter<string>();

  //#endregion

  //#region state

  private _permission!: TaonPermissionEntity;

  readonly description = signal('');

  readonly draftDescription = signal('');

  readonly editMode = signal(false);

  readonly saving = signal(false);

  //#endregion

  //#region methods

  edit(): void {
    this.draftDescription.set(this.description());

    this.editMode.set(true);
  }

  cancel(): void {
    this.draftDescription.set(this.description());

    this.editMode.set(false);
  }

  async save(): Promise<void> {
    if (!this.permission?.id) {
      return;
    }

    const newDescription = this.draftDescription();

    this.saving.set(true);

    try {
      await this.taonPermissionApiService.updateDescription(
        this.permission.id as number,
        newDescription,
      );

      this.permission.description = newDescription;

      this.description.set(newDescription);

      this.editMode.set(false);

      this.descriptionChanged.emit(newDescription);
    } finally {
      this.saving.set(false);
    }
  }

  //#endregion
}
