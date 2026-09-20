//#region imports
import { Injectable } from '@angular/core';
import { NEVER, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { ClassHelpers, Taon, TaonBaseAngularService } from 'taon/src';

import { TaonSessionUserEntity } from '../taon-session-user/taon-session-user.entity';

import { TaonSessionController } from './taon-session.controller';
import {
  TaonSessionConfig,
  TaonSessionProvider,
} from './taon-session.provider';
//#endregion

@Injectable()
export class TaonSessionConfigService extends TaonBaseAngularService {
  private taonSessionProvider = this.injectProvider(TaonSessionProvider);

  clone(): TaonSessionConfig {
    const cloned = this.taonSessionProvider.clone();
    return cloned;
  }
}
