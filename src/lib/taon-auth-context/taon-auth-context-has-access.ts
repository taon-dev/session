import {
  TaonSessionCoreAuthorization,
  TaonSessionCorePermissions,
  TaonSessionCoreRoles,
} from '../index';

import { TaonAuthContextEntity } from './taon-auth-context.entity';

export class TaonAuthContextHasAccess {
  constructor(
    private context: TaonAuthContextEntity<TaonSessionCoreAuthorization>,
  ) {}

  get toViewEmail(): boolean {
    return this.context.isSuperUser; // TODO implement emails
  }

  get toViewUsers(): boolean {
    return (
      this.context.isSuperUser ||
      this.context.hasRole(TaonSessionCoreRoles.AuthorizationManager) ||
      this.context.hasPermission(TaonSessionCorePermissions.ViewUsers)
    );
  }

  get toViewAuthorization(): boolean {
    return (
      this.context.isSuperUser ||
      this.context.hasRole(TaonSessionCoreRoles.AuthorizationManager)
    );
  }

  get toViewSessions(): boolean {
    return (
      this.context.isSuperUser ||
      this.context.hasRole(TaonSessionCoreRoles.UserManager) ||
      this.context.hasPermission(TaonSessionCorePermissions.ViewSessions)
    );
  }
}
