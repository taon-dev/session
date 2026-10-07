//#region imports
import { TaonSessionUserEntity } from '../taon-session-user/taon-session-user.entity';
import { TaonSessionEntity } from '../taon-session/taon-session.entity';
import {
  CustomColumn,
  Taon,
  TaonBaseAbstractEntity,
  TaonBaseEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

//#endregion

export interface TaonAuthorizationSchema {
  group: string;
  role: string;
  permission: string;
}

@TaonEntity({
  className: 'TaonAuthContextEntity',
  createTable: false,
})
export class TaonAuthContextEntity<
  AUTH extends TaonAuthorizationSchema = {
    group: string;
    role: string;
    permission: string;
  },
> extends TaonBaseEntity<TaonAuthContextEntity> {
  user!: TaonSessionUserEntity;

  isSuperUser: boolean = false;

  isLocalhostBackend: boolean = false;

  session!: TaonSessionEntity;

  groups: AUTH['group'][] = [];

  roles: AUTH['role'][] = [];

  permissions: AUTH['permission'][] = [];

  hasPermission(permission: AUTH['permission']): boolean {
    if (this.isSuperUser) {
      return true;
    }
    return this.permissions.includes(permission);
  }

  hasRole(role: AUTH['role']): boolean {
    if (this.isSuperUser) {
      return true;
    }
    return this.roles.includes(role);
  }

  isInGroup(group: AUTH['group']): boolean {
    if (this.isSuperUser) {
      return true;
    }
    return this.groups.includes(group);
  }
}
