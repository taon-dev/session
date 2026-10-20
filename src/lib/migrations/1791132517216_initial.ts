import {
  TaonAuthContextRepository,
  TaonSessionCoreAuthorization,
  TaonSessionCoreGroups,
  TaonSessionCorePermissions,
  TaonSessionCoreRoles,
} from '@taon-dev/session/src';
import {} from '@taon-dev/session/src';
import { Taon, TaonBaseMigration, TaonMigration } from 'taon/src';
import { QueryRunner } from 'taon-typeorm/src';

//#region Migration class for context "CmsContext"
@TaonMigration({
  className: 'SessionContext_1791132517216_initial',
})
export class SessionContext_1791132517216_initial extends TaonBaseMigration {
  protected taonAuthContextRepository = this.injectCustomRepo(
    TaonAuthContextRepository,
  );

  protected async persistTree(): Promise<void> {
    //#region @websqlFunc
    await this.taonAuthContextRepository.persistTree({
      authorization: {
        groups: TaonSessionCoreGroups,
        roles: TaonSessionCoreRoles,
        permissions: TaonSessionCorePermissions,
      },

      tree: {
        groupAndRoles: {
          // Administrators receive all core administrative roles.
          [TaonSessionCoreGroups.Administrator]: '*',

          // Normal customers receive no administrative roles by default.
          [TaonSessionCoreGroups.Customers]: [],
        },

        rolesAndPermissions: {
          [TaonSessionCoreRoles.AuthorizationManager]: [
            TaonSessionCorePermissions.ViewUsers,
            TaonSessionCorePermissions.ViewUserAuthorization,
            TaonSessionCorePermissions.ManageUserRoles,
            TaonSessionCorePermissions.ManageUserPermissions,
          ],

          [TaonSessionCoreRoles.UserManager]: [
            TaonSessionCorePermissions.ViewUsers,
            TaonSessionCorePermissions.ManageUsers,
            TaonSessionCorePermissions.ViewSessions,
            TaonSessionCorePermissions.RevokeSessions,
          ],
        },
      },
    });
    //#endregion
  }

  //#region up
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.startTransaction();
    try {
      await this.persistTree();
      await queryRunner.commitTransaction();
    } catch (error) {
      console.error('Error in migration:', error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
  //#endregion

  //#region down
  async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.startTransaction();
    try {
      await this.taonAuthContextRepository.clearRolesGroupPermissions();

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error('Error in migration:', error);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
  //#endregion
}
//#endregion
