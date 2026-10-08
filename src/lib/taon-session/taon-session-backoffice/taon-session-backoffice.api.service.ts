import { Injectable } from '@angular/core';
import { TaonBaseAngularService } from 'taon/src';

import { TaonSessionBackofficeController } from './taon-session-backoffice.controller';
import { TaonSessionBackofficeModels } from './taon-session-backoffice.models';

@Injectable()
export class TaonSessionBackofficeApiService extends TaonBaseAngularService {
  readonly taonSessionBackofficeController = this.injectController(
    TaonSessionBackofficeController,
  );

  async getSessionDetails(
    id: number,
  ): Promise<TaonSessionBackofficeModels.SessionDetails> {
    const response = await this.taonSessionBackofficeController
      .getBy(id)
      .request();
    return response.body.json;
  }
}
