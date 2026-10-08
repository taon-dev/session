//#region @browser
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { TaonGroupApiService } from '../../taon-group/taon-group-api.service';
import type { TaonGroupEntity } from '../../taon-group/taon-group.entity';
import { TaonRoleApiService } from '../../taon-role/taon-role-api.service';
import type { TaonRoleEntity } from '../../taon-role/taon-role.entity';
import { TaonPermissionApiService } from '../../taon-permission/taon-permission-api.service';
import type { TaonPermissionEntity } from '../../taon-permission/taon-permission.entity';
import { TaonSessionUserApiService } from '../../taon-session-user/taon-session-user-api.service';
import type { TaonSessionUserEntity } from '../../taon-session-user/taon-session-user.entity';
import { TaonSessionBackofficeApiService } from './taon-session-backoffice.api.service';
import type { TaonSessionBackofficeModels } from './taon-session-backoffice.models';

export type TaonBackofficeDetail =
  | { kind: 'user'; entity: TaonSessionUserEntity }
  | { kind: 'group'; entity: TaonGroupEntity }
  | { kind: 'role'; entity: TaonRoleEntity }
  | { kind: 'permission'; entity: TaonPermissionEntity }
  | { kind: 'session'; entity: TaonSessionBackofficeModels.SessionDetails };

export const taonBackofficeDetailsResolver: ResolveFn<
  TaonBackofficeDetail
> = async route => {
  const id = Number(route.paramMap.get('id'));
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error('Invalid backoffice entity ID');
  }

  let detail: TaonBackofficeDetail;
  switch (route.data['kind']) {
    case 'session':
      detail = {
        kind: 'session',
        entity: await inject(TaonSessionBackofficeApiService).getSessionDetails(id),
      };
      break;
    case 'user':
      detail = {
        kind: 'user',
        entity: (await inject(TaonSessionUserApiService)
          .taonSessionUserController.getBy(id).request()).body.json,
      };
      break;
    case 'group':
      detail = {
        kind: 'group',
        entity: (await inject(TaonGroupApiService)
          .taonGroupController.getBy(id).request()).body.json,
      };
      break;
    case 'role':
      detail = {
        kind: 'role',
        entity: (await inject(TaonRoleApiService)
          .taonRoleController.getBy(id).request()).body.json,
      };
      break;
    case 'permission':
      detail = {
        kind: 'permission',
        entity: (await inject(TaonPermissionApiService)
          .taonPermissionController.getBy(id).request()).body.json,
      };
      break;
    default:
      throw new Error('Unknown backoffice entity');
  }
  if (!detail.entity) {
    throw new Error('Backoffice entity not found');
  }
  return detail;
};

//#endregion
