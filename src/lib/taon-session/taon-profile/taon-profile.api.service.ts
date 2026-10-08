//#region imports
import { Injectable } from '@angular/core';
import { TaonBaseAngularService } from 'taon/src';

import { TaonProfileController } from './taon-profile.controller';
import { TaonProfileModels } from './taon-profile.models';
//#endregion

@Injectable()
export class TaonProfileApiService extends TaonBaseAngularService {
  //#region controllers

  public readonly taonProfileController = this.injectController(
    TaonProfileController,
  );

  //#endregion

  //#region methods

  async hasProfilePicture(userId?: number | string): Promise<boolean> {
    const response = await this.taonProfileController
      .exists(TaonProfileModels.pictureKey(userId))
      .request();

    return response.body.json;
  }

  async getProfilePictureBlob(
    userId?: number | string,
  ): Promise<Blob | undefined> {
    if (!(await this.hasProfilePicture(userId))) {
      return undefined;
    }

    const response = await this.taonProfileController
      .download(TaonProfileModels.pictureKey(userId))
      .request();

    const blobFromPicture = await response.body.native.blob();
    // console.log({ blobFromPicture });
    return blobFromPicture;
  }

  async uploadProfilePicture(
    file: File,
    userId?: number | string,
  ): Promise<void> {
    const renamedFile = new File(
      [file],
      TaonProfileModels.PROFILE_PICTURE_FILE_NAME,
      {
        type: file.type,
        lastModified: file.lastModified,
      },
    );

    const formData = new FormData();

    formData.append('file', renamedFile);

    await this.taonProfileController
      .uploadFormDataToServer(
        formData,
        userId === undefined ? undefined : { userId: Number(userId) },
      )
      .request();
  }

  async deleteProfilePicture(userId?: number | string): Promise<void> {
    await this.taonProfileController
      .delete(TaonProfileModels.pictureKey(userId))
      .request();
  }

  //#endregion
}
