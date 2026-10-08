export namespace TaonProfileModels {
  export const PROFILE_PICTURE_FILE_NAME = 'profile-picture';

  export interface PictureQuery {
    userId?: number;
  }

  export function pictureKey(userId?: number | string): string {
    return userId === undefined
      ? PROFILE_PICTURE_FILE_NAME
      : `${userId}__${PROFILE_PICTURE_FILE_NAME}`;
  }

  export const PROFILE_PICTURE_ACCEPT =
    'image/png,image/jpeg,image/webp,image/gif';
}
