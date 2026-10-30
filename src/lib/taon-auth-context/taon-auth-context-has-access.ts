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

  //#region to view email
  get toViewTaonAdminButton(): boolean {
    //#region @browserFunc
    return this.context.snapshoot.toViewTaonAdminButton;
    //#endregion
    //#region @websqlFunc
    return (
      this.context.isSuperUser ||
      this.context.isLocalhostBackend ||
      this.context.isInGroup(TaonSessionCoreGroups.Administrator)
    );
    //#endregion
  }
  //#endregion

  //#region to view email
  get toManagePosts(): boolean {
    //#region @browserFunc
    return this.context.snapshoot.toManagePosts;
    //#endregion
    //#region @websqlFunc
    return (
      this.context.isSuperUser ||
      this.context.isLocalhostBackend ||
      this.context.isInGroup(TaonSessionCoreGroups.Administrator)
    );
    //#endregion
  }
  //#endregion

  //#region to view email
  get toViewEmail(): boolean {
    //#region @browserFunc
    return this.context.snapshoot.toViewEmail;
    //#endregion
    //#region @websqlFunc
    return this.context.isSuperUser; // TODO implement emails
    //#endregion
  }
  //#endregion

  //#region to view users
  get toViewUsers(): boolean {
    //#region @browserFunc
    return this.context.snapshoot.toViewUsers;
    //#endregion
    //#region @websqlFunc
    return (
      this.context.isSuperUser ||
      this.context.isLocalhostBackend ||
      this.context.isInGroup(TaonSessionCoreGroups.Administrator)
    );
    //#endregion
  }
  //#endregion

  //#region to view authorization
  get toViewAuthorization(): boolean {
    //#region @browserFunc
    return this.context.snapshoot.toViewAuthorization;
    //#endregion
    //#region @websqlFunc
    return (
      this.context.isSuperUser ||
      this.context.isLocalhostBackend ||
      this.context.isInGroup(TaonSessionCoreGroups.Administrator)
    );
    //#endregion
  }
  //#endregion

  //#region to view sessions
  get toViewSessions(): boolean {
    //#region @browserFunc
    return this.context.snapshoot.toViewAuthorization;
    //#endregion
    //#region @websqlFunc
    return (
      this.context.isSuperUser ||
      this.context.isLocalhostBackend ||
      this.context.isInGroup(TaonSessionCoreGroups.Administrator)
    );
    //#endregion
  }
  //#endregion
}
