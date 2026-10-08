//#region imports
import { Translation } from '@taon-dev/i18n/src';
import {
  ExpressRequest,
  ExpressResponse,
  getStatusCode,
  HttpStatusEnum,
  Models,
  Taon,
  TaonStorageObject,
  TaonUploadedFile,
} from 'taon/src';
import { TaonController, TaonBaseStorageController } from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonAuthContextRepository } from '../../taon-auth-context/taon-auth-context.repository';
import { TaonSessionUserRepository } from '../../taon-session-user/taon-session-user.repository';
import { TaonSessionRepository } from '../taon-session.repository';

import { TaonProfileModels } from './taon-profile.models';
//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@TaonController<TaonProfileController>({
  className: 'TaonProfileController',
  allowedMethods: ['exists', 'download', 'delete', 'uploadFormDataToServer'],
})
export class TaonProfileController extends TaonBaseStorageController<
  TaonProfileModels.PictureQuery
> {
  //#region storage hooks

  private readonly taonSessionRepository = this.injectCustomRepo(TaonSessionRepository);

  private readonly authRepository = this.injectCustomRepo(
    TaonAuthContextRepository,
  );

  private readonly userRepository = this.injectCustomRepo(
    TaonSessionUserRepository,
  );

  async beforeEachRequest({
    req,
    res,
    methodConfig,
    classConfig,
  }: Models.TaonCtrlBeforeEachRequestParams<TaonProfileController>): Promise<void> {
    //#region @backendFunc
    await this.taonSessionRepository.throwIfNotAuthenticated({
      req,
      res,
    });

    const currentUserId = Number('userId' in req ? req.userId : undefined);
    const keyValue = req.query.key;
    const targetKey =
      typeof keyValue === 'string'
        ? /^([1-9]\d*)__profile-picture$/.exec(keyValue)
        : null;
    const isUpload = methodConfig.methodName === 'uploadFormDataToServer';
    const userId = isUpload
      ? Number(req.query.userId ?? currentUserId)
      : targetKey
        ? Number(targetKey[1])
        : currentUserId;

    if (
      !Number.isSafeInteger(userId) ||
      userId <= 0 ||
      (!isUpload &&
        keyValue !== TaonProfileModels.PROFILE_PICTURE_FILE_NAME &&
        !targetKey)
    ) {
      Taon.error({
        status: getStatusCode(HttpStatusEnum.FORBIDDEN),
        message: t.gettext('Invalid profile picture request'),
      });
    }

    if (userId !== currentUserId) {
      if (isUpload || methodConfig.methodName === 'delete') {
        const context = await this.authRepository.getContext(currentUserId);
        if (!context.isSuperUser) {
          Taon.error({
            status: getStatusCode(HttpStatusEnum.FORBIDDEN),
            message: t.gettext(
              'Only super users can change another user profile picture',
            ),
          });
        }
      }
      if (!(await this.userRepository.findOne({ where: { id: userId } }))) {
        Taon.error({
          status: getStatusCode(HttpStatusEnum.NOT_FOUND),
          message: t.gettext('User not found'),
        });
      }
    }

    if (isUpload) {
      req.query.userId = String(userId);
    } else {
      req.query.key = TaonProfileModels.pictureKey(userId);
    }
    //#endregion
  }

  protected async handleUploadFiles(
    bodyFormDataFiles: TaonUploadedFile[],
    queryParams?: TaonProfileModels.PictureQuery,
    req?: ExpressRequest<any>,
    res?: ExpressResponse<any>,
  ): Promise<TaonStorageObject[]> {
    //#region @backendFunc
    if (bodyFormDataFiles.length === 1) {
      const userId = Number(queryParams?.userId);
      const file = _.first(bodyFormDataFiles);
      // console.log({ file });
      file.fileName = TaonProfileModels.pictureKey(userId);
    } else {
      Taon.error({
        status: getStatusCode(HttpStatusEnum.FORBIDDEN),
        message: t.gettext('You are not authroized to upload many files'),
      });
    }
    return super.handleUploadFiles(bodyFormDataFiles, queryParams, req, res);
    //#endregion
  }

  async afterFileUploadHook(
    fileObject?: TaonStorageObject,
    queryParams?: TaonProfileModels.PictureQuery,
  ): Promise<void> {
    // Authentication / authorization / profile persistence can be added here.
  }

  buildStorageDownloadUrl(options: {
    req: any;
    key: string;
    private: boolean;
    token?: string;
  }): string {
    throw new Error('TODO');
  }

  async createStorageDownloadToken(options: {
    key: string;
    expiresAt: number;
  }): Promise<string> {
    throw new Error('TODO');
  }

  //#endregion
}
