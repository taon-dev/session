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

import { TaonSessionRepository } from '../taon-session.repository';

import { TaonProfileModels } from './taon-profile.models';
//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@TaonController<TaonProfileController>({
  className: 'TaonProfileController',
  allowedMethods: ['exists', 'download', 'delete', 'uploadFormDataToServer'],
})
export class TaonProfileController extends TaonBaseStorageController<{}> {
  //#region storage hooks

  taonSessionRepository = this.injectCustomRepo(TaonSessionRepository);

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

    const userId = (req as any)!.userId;
    const keyValue = req.query.key;
    // console.log({ keyValue });
    if (keyValue === TaonProfileModels.PROFILE_PICTURE_FILE_NAME) {
      req.query.key = `${userId}__${TaonProfileModels.PROFILE_PICTURE_FILE_NAME}`;
    } else {
      delete req.query.key;
    }
    //#endregion
  }

  protected async handleUploadFiles(
    bodyFormDataFiles: TaonUploadedFile[],
    queryParams?: {},
    req?: ExpressRequest<any>,
    res?: ExpressResponse<any>,
  ): Promise<TaonStorageObject[]> {
    //#region @backendFunc
    if (bodyFormDataFiles.length === 1) {
      const userId = (req as any)!.userId;
      const file = _.first(bodyFormDataFiles);
      // console.log({ file });
      file.fileName = `${userId}__${TaonProfileModels.PROFILE_PICTURE_FILE_NAME}`;
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
    queryParams?: {},
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
