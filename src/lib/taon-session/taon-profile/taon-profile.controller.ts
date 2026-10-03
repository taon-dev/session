//#region imports
import { Models, TaonStorageObject } from 'taon/src';
import { TaonController, TaonBaseStorageController } from 'taon/src';
import { TaonSessionRepository } from '../taon-session.repository';
import { TaonProfileModels } from './taon-profile.models';
//#endregion

@TaonController<TaonProfileController>({
  className: 'TaonProfileController',
  allowedMethods: ['exists', 'download', 'delete', 'uploadFormDataToServer'],
})
export class TaonProfileController extends TaonBaseStorageController {
  //#region storage hooks

  taonSessionRepository = this.injectCustomRepo(TaonSessionRepository);

  async beforeEachRequest({
    req,
    res,
    methodConfig,
    classConfig,
  }: Models.TaonCtrlBeforeEachRequestParams<TaonProfileController>): Promise<void> {
    await this.taonSessionRepository.throwIfNotAuthenticated({
      req,
      res,
    });

    const userId = (req as any)!.userId;
    const keyValue = req.query.key;
    console.log({ keyValue });
    if (keyValue === TaonProfileModels.PROFILE_PICTURE_FILE_NAME) {
      req.query.key = `${userId}__${TaonProfileModels.PROFILE_PICTURE_FILE_NAME}`;
    } else if (
      req.query.key ===
      `${userId}__${TaonProfileModels.PROFILE_PICTURE_FILE_NAME}`
    ) {
      // nothing
    } else {
      delete req.query.key;
    }
    console.log('req.query.key', req.query.key);
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
