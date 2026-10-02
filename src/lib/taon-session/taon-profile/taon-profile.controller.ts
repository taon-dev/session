//#region imports
import { TaonStorageObject } from 'taon/src';
import { TaonController, TaonBaseStorageController } from 'taon/src';
//#endregion

@TaonController<TaonProfileController>({
  className: 'TaonProfileController',
})
export class TaonProfileController extends TaonBaseStorageController {
  //#region storage hooks

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
