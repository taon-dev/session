//#region imports
import { TaonSessionUserEntity } from '../taon-session-user/taon-session-user.entity';
import { TaonSessionEntity } from '../taon-session/taon-session.entity';
import {
  CustomColumn,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';


import { TaonAuthContextDefaultsValues } from './taon-auth-context.constants';
//#endregion

@TaonEntity({
  className: 'TaonAuthContextEntity',
  createTable: false,
})
export class TaonAuthContextEntity extends TaonBaseAbstractEntity<TaonAuthContextEntity> {
  user!: TaonSessionUserEntity;

  session!: TaonSessionEntity;

  groups: string[] = [];

  roles: string[] = [];

  permissions: string[] = [];

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  isInGroup(group: string): boolean {
    return this.groups.includes(group);
  }
}
