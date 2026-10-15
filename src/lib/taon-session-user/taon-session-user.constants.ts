import { TaonAuthorizationSchema } from '../index';
import type { TaonSessionUserEntity } from './taon-session-user.entity';

export const TaonSessionUserDefaultsValues =
  {} as Partial<TaonSessionUserEntity>;

export const TaonSessionCoreGroups = {
  /**
   * @default taon core group
   * Administrators can manage authorization of regular users.
   * Only superusers can add/remove users from this group.
   */
  Administrator: 'administrator',

  /**
   * @default taon core group
   * Regular authenticated users/customers.
   */
  Customers: 'customers',
} as const;

export const TaonSessionCoreRoles = {
  /**
   * Can manage roles and permissions assigned directly to users.
   * Does NOT allow changing user groups.
   */
  AuthorizationManager: 'authorization-manager',

  /**
   * Can manage users and their basic account information.
   */
  UserManager: 'user-manager',
} as const;

export const TaonSessionCorePermissions = {
  /**
   * View users.
   */
  ViewUsers: 'view-users',

  /**
   * Edit basic user information.
   */
  ManageUsers: 'manage-users',

  /**
   * View user authorization configuration.
   */
  ViewUserAuthorization: 'view-user-authorization',

  /**
   * Assign/remove roles from users.
   */
  ManageUserRoles: 'manage-user-roles',

  /**
   * Assign/remove permissions directly from users.
   */
  ManageUserPermissions: 'manage-user-permissions',

  /**
   * View active sessions.
   */
  ViewSessions: 'view-sessions',

  /**
   * Revoke user sessions.
   */
  RevokeSessions: 'revoke-sessions',
} as const;

export interface TaonSessionCoreAuthorization extends TaonAuthorizationSchema {
  groups: typeof TaonSessionCoreGroups;
  roles: typeof TaonSessionCoreRoles;
  permissions: typeof TaonSessionCorePermissions;
}
