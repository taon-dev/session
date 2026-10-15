//#region imports
import { TaonBaseEntity, TaonEntity } from 'taon/src';
import { CoreModels } from 'tnp-core/src';

import { TaonSessionEntity } from '../taon-session/taon-session.entity';
import { TaonSessionUserEntity } from '../taon-session-user/taon-session-user.entity';

import { TaonAuthContextHasAccess } from './taon-auth-context-has-access';

//#endregion

export type TaonAuthorizationDefinition = Readonly<Record<string, string>>;

export interface TaonAuthorizationSchema {
  groups: TaonAuthorizationDefinition;
  roles: TaonAuthorizationDefinition;
  permissions: TaonAuthorizationDefinition;
}

@TaonEntity<TaonAuthContextEntity>({
  className: 'TaonAuthContextEntity',
  createTable: false,
})
export class TaonAuthContextEntity<
  AUTH extends TaonAuthorizationSchema = TaonAuthorizationSchema,
> extends TaonBaseEntity<TaonAuthContextEntity> {
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  get hasAccess() {
    return this.injectClass<TaonAuthContextHasAccess, [TaonAuthContextEntity]>(
      TaonAuthContextHasAccess,
      this,
    );
  }

  user!: TaonSessionUserEntity;

  session!: TaonSessionEntity;

  isSuperUser = false;

  isLocalhostBackend = false;

  groups: CoreModels.ValueOf<AUTH['groups']>[] = [];

  roles: CoreModels.ValueOf<AUTH['roles']>[] = [];

  permissions: CoreModels.ValueOf<AUTH['permissions']>[] = [];

  hasPermission(permission: CoreModels.ValueOf<AUTH['permissions']>): boolean {
    return this.isSuperUser || this.permissions.includes(permission);
  }

  hasRole(role: CoreModels.ValueOf<AUTH['roles']>): boolean {
    return this.isSuperUser || this.roles.includes(role);
  }

  isInGroup(group: CoreModels.ValueOf<AUTH['groups']>): boolean {
    return this.isSuperUser || this.groups.includes(group);
  }
}
