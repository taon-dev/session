//#region imports
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
  inject,
  signal,
  forwardRef,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonProfileApiService } from '../taon-profile.api.service';
import { TaonProfileModels } from '../taon-profile.models';
//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-profile-picture',
  templateUrl: './taon-profile-picture.component.html',
  styleUrls: ['./taon-profile-picture.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  providers: [forwardRef(() => TaonProfileApiService)],
})
export class TaonProfilePictureComponent implements OnDestroy, OnInit, OnChanges {
  //#region inject

  @Input() hideButtons: boolean = false;

  @Input() userId?: number | string;

  @Input() readOnly = false;

  public readonly t = t.for(this);

  private readonly taonProfileApiService = inject(TaonProfileApiService);

  //#endregion

  //#region state

  readonly pictureUrl = signal<string | undefined>(undefined);

  readonly loading = signal(false);

  readonly uploading = signal(false);

  readonly accept = TaonProfileModels.PROFILE_PICTURE_ACCEPT;

  private objectUrl?: string;

  private destroyed = false;

  private loadVersion = 0;

  //#endregion

  //#region lifecycle

  ngOnInit(): void {
    void this.loadProfilePicture();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.userId && !changes.userId.firstChange) {
      void this.loadProfilePicture();
    }
  }

  //#endregion

  //#region methods

  async loadProfilePicture(): Promise<void> {
    this.loading.set(true);
    const version = ++this.loadVersion;
    this.clearPictureUrl();

    try {
      const blob = await this.taonProfileApiService.getProfilePictureBlob(
        this.userId,
      );

      if (!this.destroyed && version === this.loadVersion) {
        this.setPictureBlob(blob);
      }
    } finally {
      if (version === this.loadVersion) {
        this.loading.set(false);
      }
    }
  }

  async fileSelected(event: Event): Promise<void> {
    if (this.readOnly) {
      throw new Error('Profile picture is read-only');
    }
    const input = event.target as HTMLInputElement;

    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.uploading.set(true);

    try {
      await this.taonProfileApiService.uploadProfilePicture(file, this.userId);

      await this.loadProfilePicture();
    } finally {
      this.uploading.set(false);

      // Allows selecting the same file again.
      input.value = '';
    }
  }

  async removePicture(): Promise<void> {
    if (this.readOnly) {
      throw new Error('Profile picture is read-only');
    }
    this.uploading.set(true);
    const userId = this.userId;

    try {
      await this.taonProfileApiService.deleteProfilePicture(userId);

      if (!this.destroyed && userId === this.userId) {
        ++this.loadVersion;
        this.loading.set(false);
        this.clearPictureUrl();
      }
    } finally {
      this.uploading.set(false);
    }
  }

  private setPictureBlob(blob: Blob | undefined): void {
    this.clearPictureUrl();

    if (!blob) {
      return;
    }

    this.objectUrl = URL.createObjectURL(blob);

    this.pictureUrl.set(this.objectUrl);
  }

  private clearPictureUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);

      this.objectUrl = undefined;
    }

    this.pictureUrl.set(undefined);
  }

  //#endregion

  //#region destroy

  ngOnDestroy(): void {
    this.destroyed = true;
    this.clearPictureUrl();
  }

  //#endregion
}
