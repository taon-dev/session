//#region imports
import {
  TaonSessionCoreAuthorization,
  TaonSessionCoreGroups,
  TaonSessionCorePermissions,
  TaonSessionCoreRoles,
} from '../index';

import { TaonAuthContextEntity } from './taon-auth-context.entity';
//#endregion

export class TaonAuthContextHasAccess {
  //#region constructor
  constructor(
    protected context: TaonAuthContextEntity<TaonSessionCoreAuthorization>,
  ) {}
  //#endregion

  //#region clone
  clone(): Omit<TaonAuthContextHasAccess, 'context' | 'clone'> {
    const result: Record<string, boolean> = {};

    let prototype = Object.getPrototypeOf(this);

    while (prototype && prototype !== Object.prototype) {
      for (const key of Object.getOwnPropertyNames(prototype)) {
        if (key === 'constructor' || key === 'clone') {
          continue;
        }

        // Child getter wins over parent getter
        if (key in result) {
          continue;
        }

        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);

        if (descriptor?.get) {
          result[key] = descriptor.get.call(this);
        }
      }

      prototype = Object.getPrototypeOf(prototype);
    }

    return result as Omit<TaonAuthContextHasAccess, 'context' | 'clone'>;
  }
  //#endregion

  //#region to view taon admin button
  get toViewTaonAdminButton(): boolean {
    //#region @browserFunc
    return !!this.context.snapshoot.toViewTaonAdminButton;
    //#endregion
    //#region @websqlFunc
    return (
      this.context.isSuperUser ||
      this.context.isInGroup(TaonSessionCoreGroups.Administrator)
    );
    //#endregion
  }
  //#endregion

  //#region to manage e-commerce
  get toManagerEcommerce(): boolean {
    //#region @browserFunc
    return !!this.context.snapshoot.toManagerEcommerce;
    //#endregion
    //#region @websqlFunc
    return (
      this.context.isSuperUser ||
      this.context.isInGroup(TaonSessionCoreGroups.Administrator)
    );
    //#endregion
  }
  //#endregion

  //#region to manage seo
  get toManageSeo(): boolean {
    //#region @browserFunc
    return !!this.context.snapshoot.toManageSeo;
    //#endregion
    //#region @websqlFunc
    return (
      this.context.isSuperUser ||
      this.context.isInGroup(TaonSessionCoreGroups.Administrator)
    );
    //#endregion
  }
  //#endregion

  //#region to manage analytics
  get toManageAnalytics(): boolean {
    //#region @browserFunc
    return !!this.context.snapshoot.toManageAnalytics;
    //#endregion
    //#region @websqlFunc
    return (
      this.context.isSuperUser ||
      this.context.isInGroup(TaonSessionCoreGroups.Administrator)
    );
    //#endregion
  }
  //#endregion

  //#region to manage marketing
  get toManageMarketing(): boolean {
    //#region @browserFunc
    return !!this.context.snapshoot.toManageMarketing;
    //#endregion
    //#region @websqlFunc
    return (
      this.context.isSuperUser ||
      this.context.isInGroup(TaonSessionCoreGroups.Administrator)
    );
    //#endregion
  }
  //#endregion

  //#region to manage cms
  get toManageCms(): boolean {
    //#region @browserFunc
    return !!this.context.snapshoot.toManageCms;
    //#endregion
    //#region @websqlFunc
    return (
      this.context.isSuperUser ||
      this.context.isInGroup(TaonSessionCoreGroups.Administrator)
    );
    //#endregion
  }
  //#endregion

  //#region to manage emails
  get toManageEmails(): boolean {
    //#region @browserFunc
    return !!this.context.snapshoot.toManageEmails;
    //#endregion
    //#region @websqlFunc
    return this.context.isSuperUser; // TODO implement emails
    //#endregion
  }
  //#endregion

  //#region to manage users
  get toManageUsers(): boolean {
    //#region @browserFunc
    return !!this.context.snapshoot.toManageUsers;
    //#endregion
    //#region @websqlFunc
    return (
      this.context.isSuperUser ||
      this.context.isInGroup(TaonSessionCoreGroups.Administrator)
    );
    //#endregion
  }
  //#endregion

  //#region to manage authorization
  get toManageAuthorization(): boolean {
    //#region @browserFunc
    return !!this.context.snapshoot.toManageAuthorization;
    //#endregion
    //#region @websqlFunc
    return (
      this.context.isSuperUser ||
      this.context.isInGroup(TaonSessionCoreGroups.Administrator)
    );
    //#endregion
  }
  //#endregion

  //#region to manage sessions
  get toManageSessions(): boolean {
    //#region @browserFunc
    return !!this.context.snapshoot.toManageSessions;
    //#endregion
    //#region @websqlFunc
    return (
      this.context.isSuperUser ||
      this.context.isInGroup(TaonSessionCoreGroups.Administrator)
    );
    //#endregion
  }
  //#endregion
}
