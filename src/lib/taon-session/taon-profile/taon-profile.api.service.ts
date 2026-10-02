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

  async hasProfilePicture(): Promise<boolean> {
    const response = await this.taonProfileController
      .exists(TaonProfileModels.PROFILE_PICTURE_FILE_NAME)
      .request();

    return response.body.json;
  }

  async getProfilePictureBlob(): Promise<Blob | undefined> {
    if (!(await this.hasProfilePicture())) {
      return undefined;
    }

    const response = await this.taonProfileController
      .download(TaonProfileModels.PROFILE_PICTURE_FILE_NAME)
      .request();

    const blobFromPicture = await response.body.native.blob();
    // console.log({ blobFromPicture });
    return blobFromPicture;
  }

  async uploadProfilePicture(file: File): Promise<void> {
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

    await this.taonProfileController.uploadFormDataToServer(formData).request();
  }

  async deleteProfilePicture(): Promise<void> {
    await this.taonProfileController
      .delete(TaonProfileModels.PROFILE_PICTURE_FILE_NAME)
      .request();
  }

  //#endregion
}
