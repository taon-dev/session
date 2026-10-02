//#region imports
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Taon, TaonBaseAngularService } from 'taon/src';

import { TaonProfileProvider } from './taon-profile.provider';
//#endregion

@Injectable()
export class TaonProfileConfigService extends TaonBaseAngularService {
  private taonProfileProvider = this.injectProvider(TaonProfileProvider);

  clone(): Partial<TaonProfileProvider> {
    const cloned = this.taonProfileProvider.clone();
    return cloned;
  }
}
