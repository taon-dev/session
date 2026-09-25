import { TaonGroupEntity, TaonGroupRepository } from '@taon-dev/session/src';
import {
  TaonPermissionEntity,
  TaonPermissionRepository,
} from '@taon-dev/session/src';
import { TaonRoleRepository } from '@taon-dev/session/src';
import { Taon, TaonBaseMigration, TaonMigration } from 'taon/src';
import { QueryRunner } from 'taon-typeorm/src';

import { TaonGroupRoleRepository } from '../taon-group/taon-group-role.repository';
import { TaonRolePermissionRepository } from '../taon-role/taon-role-permission.repository';
import { TaonRoleEntity } from '../taon-role/taon-role.entity';

//#region Migration class for context "SessionContext"
@TaonMigration({
  className: 'SessionContext_1790328479283_initial',
})
export class SessionContext_1790328479283_initial extends TaonBaseMigration {
  groupRepo = this.injectCustomRepo(TaonGroupRepository);

  roleRepo = this.injectCustomRepo(TaonRoleRepository);

  permissionRepo = this.injectCustomRepo(TaonPermissionRepository);

  groupRoleRepo = this.injectCustomRepo(TaonGroupRoleRepository);

  rolePermissionRepo = this.injectCustomRepo(TaonRolePermissionRepository);

  //#region up
  async up(queryRunner: QueryRunner): Promise<void> {
    //#region @websqlFunc
    await queryRunner.startTransaction();

    try {
      //#region permissions

      const watchP1 = await this.getOrCreatePermission(
        'course.bachata.p1.watch',
        'Watch Bachata P1',
      );

      const watchP2 = await this.getOrCreatePermission(
        'course.bachata.p2.watch',
        'Watch Bachata P2',
      );

      const watchP3 = await this.getOrCreatePermission(
        'course.bachata.p3.watch',
        'Watch Bachata P3',
      );

      const editVideos = await this.getOrCreatePermission(
        'video.edit',
        'Edit videos',
      );

      const editPosts = await this.getOrCreatePermission(
        'post.edit',
        'Edit posts',
      );

      //#region fake permissions

      const fakeUserView = await this.getOrCreatePermission(
        'fake.user.view',
        '[FAKE] View users',
      );

      const fakeUserCreate = await this.getOrCreatePermission(
        'fake.user.create',
        '[FAKE] Create users',
      );

      const fakeUserEdit = await this.getOrCreatePermission(
        'fake.user.edit',
        '[FAKE] Edit users',
      );

      const fakeUserDelete = await this.getOrCreatePermission(
        'fake.user.delete',
        '[FAKE] Delete users',
      );

      const fakeArticleView = await this.getOrCreatePermission(
        'fake.article.view',
        '[FAKE] View articles',
      );

      const fakeArticleCreate = await this.getOrCreatePermission(
        'fake.article.create',
        '[FAKE] Create articles',
      );

      const fakeArticleEdit = await this.getOrCreatePermission(
        'fake.article.edit',
        '[FAKE] Edit articles',
      );

      const fakeArticlePublish = await this.getOrCreatePermission(
        'fake.article.publish',
        '[FAKE] Publish articles',
      );

      const fakeArticleDelete = await this.getOrCreatePermission(
        'fake.article.delete',
        '[FAKE] Delete articles',
      );

      const fakeOrderView = await this.getOrCreatePermission(
        'fake.order.view',
        '[FAKE] View orders',
      );

      const fakeOrderEdit = await this.getOrCreatePermission(
        'fake.order.edit',
        '[FAKE] Edit orders',
      );

      const fakeOrderRefund = await this.getOrCreatePermission(
        'fake.order.refund',
        '[FAKE] Refund orders',
      );

      const fakeAnalyticsView = await this.getOrCreatePermission(
        'fake.analytics.view',
        '[FAKE] View analytics',
      );

      const fakeSettingsView = await this.getOrCreatePermission(
        'fake.settings.view',
        '[FAKE] View settings',
      );

      const fakeSettingsEdit = await this.getOrCreatePermission(
        'fake.settings.edit',
        '[FAKE] Edit settings',
      );

      //#endregion

      //#endregion

      //#region roles

      const p1Role = await this.getOrCreateRole(
        'bachata-p1-access',
        'Bachata P1 access',
      );

      const p2Role = await this.getOrCreateRole(
        'bachata-p2-access',
        'Bachata P2 access',
      );

      const p3Role = await this.getOrCreateRole(
        'bachata-p3-access',
        'Bachata P3 access',
      );

      const contentEditorRole = await this.getOrCreateRole(
        'content-editor',
        'Content editor',
      );

      const adminRole = await this.getOrCreateRole('admin', 'Administrator');

      //#region fake roles

      const fakeViewerRole = await this.getOrCreateRole(
        'fake-viewer',
        '[FAKE] Viewer',
      );

      const fakeAuthorRole = await this.getOrCreateRole(
        'fake-author',
        '[FAKE] Author',
      );

      const fakeEditorRole = await this.getOrCreateRole(
        'fake-editor',
        '[FAKE] Editor',
      );

      const fakePublisherRole = await this.getOrCreateRole(
        'fake-publisher',
        '[FAKE] Publisher',
      );

      const fakeUserManagerRole = await this.getOrCreateRole(
        'fake-user-manager',
        '[FAKE] User manager',
      );

      const fakeOrderManagerRole = await this.getOrCreateRole(
        'fake-order-manager',
        '[FAKE] Order manager',
      );

      const fakeAnalyticsRole = await this.getOrCreateRole(
        'fake-analytics',
        '[FAKE] Analytics access',
      );

      const fakeSystemManagerRole = await this.getOrCreateRole(
        'fake-system-manager',
        '[FAKE] System manager',
      );

      //#endregion

      //#endregion

      //#region role -> permission

      await this.assignPermission(p1Role, watchP1);
      await this.assignPermission(p2Role, watchP2);
      await this.assignPermission(p3Role, watchP3);

      await this.assignPermission(contentEditorRole, editVideos);
      await this.assignPermission(contentEditorRole, editPosts);

      // Admin can explicitly inherit everything for now.
      await this.assignPermission(adminRole, watchP1);
      await this.assignPermission(adminRole, watchP2);
      await this.assignPermission(adminRole, watchP3);
      await this.assignPermission(adminRole, editVideos);
      await this.assignPermission(adminRole, editPosts);

      //#region fake role -> permission

      // Viewer
      await this.assignPermission(fakeViewerRole, fakeArticleView);

      // Author
      await this.assignPermission(fakeAuthorRole, fakeArticleView);
      await this.assignPermission(fakeAuthorRole, fakeArticleCreate);
      await this.assignPermission(fakeAuthorRole, fakeArticleEdit);

      // Editor
      await this.assignPermission(fakeEditorRole, fakeArticleView);
      await this.assignPermission(fakeEditorRole, fakeArticleCreate);
      await this.assignPermission(fakeEditorRole, fakeArticleEdit);
      await this.assignPermission(fakeEditorRole, fakeArticleDelete);

      // Publisher
      await this.assignPermission(fakePublisherRole, fakeArticleView);
      await this.assignPermission(fakePublisherRole, fakeArticleEdit);
      await this.assignPermission(fakePublisherRole, fakeArticlePublish);

      // User manager
      await this.assignPermission(fakeUserManagerRole, fakeUserView);
      await this.assignPermission(fakeUserManagerRole, fakeUserCreate);
      await this.assignPermission(fakeUserManagerRole, fakeUserEdit);
      await this.assignPermission(fakeUserManagerRole, fakeUserDelete);

      // Order manager
      await this.assignPermission(fakeOrderManagerRole, fakeOrderView);
      await this.assignPermission(fakeOrderManagerRole, fakeOrderEdit);
      await this.assignPermission(fakeOrderManagerRole, fakeOrderRefund);

      // Analytics
      await this.assignPermission(fakeAnalyticsRole, fakeAnalyticsView);

      // System manager
      await this.assignPermission(fakeSystemManagerRole, fakeUserView);
      await this.assignPermission(fakeSystemManagerRole, fakeAnalyticsView);
      await this.assignPermission(fakeSystemManagerRole, fakeSettingsView);
      await this.assignPermission(fakeSystemManagerRole, fakeSettingsEdit);

      //#endregion

      //#endregion

      //#region groups

      const administrators = await this.getOrCreateGroup(
        'administrators',
        'Administrators',
      );

      const allProgramAccess = await this.getOrCreateGroup(
        'all-program-access',
        'Users with access to all programs',
      );

      //#region fake groups

      const fakeGuests = await this.getOrCreateGroup(
        'fake-guests',
        '[FAKE] Guests',
      );

      const fakeContentTeam = await this.getOrCreateGroup(
        'fake-content-team',
        '[FAKE] Content team',
      );

      const fakeMarketingTeam = await this.getOrCreateGroup(
        'fake-marketing-team',
        '[FAKE] Marketing team',
      );

      const fakeCustomerSupport = await this.getOrCreateGroup(
        'fake-customer-support',
        '[FAKE] Customer support',
      );

      const fakeManagement = await this.getOrCreateGroup(
        'fake-management',
        '[FAKE] Management',
      );

      const fakeDevelopers = await this.getOrCreateGroup(
        'fake-developers',
        '[FAKE] Developers',
      );

      const fakeSuperUsers = await this.getOrCreateGroup(
        'fake-super-users',
        '[FAKE] Super users',
      );

      //#endregion

      //#endregion

      //#region group -> role

      await this.assignRole(administrators, adminRole);

      await this.assignRole(allProgramAccess, p1Role);
      await this.assignRole(allProgramAccess, p2Role);
      await this.assignRole(allProgramAccess, p3Role);

      //#region fake group -> role

      // Guests can only view content.
      await this.assignRole(fakeGuests, fakeViewerRole);

      // Content team can author and edit.
      await this.assignRole(fakeContentTeam, fakeAuthorRole);
      await this.assignRole(fakeContentTeam, fakeEditorRole);

      // Marketing can create/publish content and see analytics.
      await this.assignRole(fakeMarketingTeam, fakeAuthorRole);
      await this.assignRole(fakeMarketingTeam, fakePublisherRole);
      await this.assignRole(fakeMarketingTeam, fakeAnalyticsRole);

      // Customer support needs users + orders.
      await this.assignRole(fakeCustomerSupport, fakeUserManagerRole);
      await this.assignRole(fakeCustomerSupport, fakeOrderManagerRole);

      // Management gets analytics and order access.
      await this.assignRole(fakeManagement, fakeAnalyticsRole);
      await this.assignRole(fakeManagement, fakeOrderManagerRole);

      // Developers get content + system management.
      await this.assignRole(fakeDevelopers, fakeEditorRole);
      await this.assignRole(fakeDevelopers, fakeSystemManagerRole);

      // Intentionally large group for testing the UI.
      await this.assignRole(fakeSuperUsers, fakeViewerRole);
      await this.assignRole(fakeSuperUsers, fakeAuthorRole);
      await this.assignRole(fakeSuperUsers, fakeEditorRole);
      await this.assignRole(fakeSuperUsers, fakePublisherRole);
      await this.assignRole(fakeSuperUsers, fakeUserManagerRole);
      await this.assignRole(fakeSuperUsers, fakeOrderManagerRole);
      await this.assignRole(fakeSuperUsers, fakeAnalyticsRole);
      await this.assignRole(fakeSuperUsers, fakeSystemManagerRole);

      //#endregion

      //#endregion

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
    //#endregion
  }
  //#endregion

  //#region helpers
  //#region @websql
  private async getOrCreatePermission(
    code: string,
    name: string,
  ): Promise<TaonPermissionEntity> {
    let entity = await this.permissionRepo.findOne({
      where: { code },
    });

    if (!entity) {
      entity = this.permissionRepo.create({
        code,
        name,
      });

      entity = await this.permissionRepo.save(entity);
    }

    return entity;
  }

  private async getOrCreateRole(
    code: string,
    name: string,
  ): Promise<TaonRoleEntity> {
    let entity = await this.roleRepo.findOne({
      where: { code },
    });

    if (!entity) {
      entity = this.roleRepo.create({
        code,
        name,
      });

      entity = await this.roleRepo.save(entity);
    }

    return entity;
  }

  private async getOrCreateGroup(
    code: string,
    name: string,
  ): Promise<TaonGroupEntity> {
    let entity = await this.groupRepo.findOne({
      where: { code },
    });

    if (!entity) {
      entity = this.groupRepo.create({
        code,
        name,
      });

      entity = await this.groupRepo.save(entity);
    }

    return entity;
  }

  private async assignPermission(
    role: TaonRoleEntity,
    permission: TaonPermissionEntity,
  ): Promise<void> {
    const exists = await this.rolePermissionRepo.exists({
      where: {
        roleId: role.id as any,
        permissionId: permission.id as any,
      },
    });

    if (!exists) {
      await this.rolePermissionRepo.save(
        this.rolePermissionRepo.create({
          roleId: role.id as any,
          permissionId: permission.id as any,
        }),
      );
    }
  }

  private async assignRole(
    group: TaonGroupEntity,
    role: TaonRoleEntity,
  ): Promise<void> {
    const exists = await this.groupRoleRepo.exists({
      where: {
        groupId: group.id as any,
        roleId: role.id as any,
      },
    });

    if (!exists) {
      await this.groupRoleRepo.save(
        this.groupRoleRepo.create({
          groupId: group.id as any,
          roleId: role.id as any,
        }),
      );
    }
  }

  //#endregion
  //#endregion

  //#region down
  async down(queryRunner: QueryRunner): Promise<void> {
    // I'd normally remove by stable `code`,
    // NOT clearDatabase().
  }
  //#endregion
}
//#endregion
