//#region imports

import {
  ExpressRequest,
  TaonBaseCustomRepository,
  TaonRepository,
} from 'taon/src';
import { CoreModels, GlobalStorage, UtilsOs } from 'tnp-core/src';

import { TaonGroupRoleRepository } from '../taon-group/taon-group-role.repository';
import { TaonGroupRepository } from '../taon-group/taon-group.repository';
import { TaonPermissionRepository } from '../taon-permission/taon-permission.repository';
import { TaonRolePermissionRepository } from '../taon-role/taon-role-permission.repository';
import { TaonRoleRepository } from '../taon-role/taon-role.repository';
import { TaonSessionProvider } from '../taon-session/taon-session.provider';
import { TaonSessionRepository } from '../taon-session/taon-session.repository';
import { TaonSessionUserRepository } from '../taon-session-user/taon-session-user.repository';

import {
  TaonAuthContextEntity,
  TaonAuthorizationSchema,
} from './taon-auth-context.entity';

//#endregion

//#region models

type GroupOf<AUTH extends TaonAuthorizationSchema> = CoreModels.ValueOf<
  AUTH['groups']
>;

type RoleOf<AUTH extends TaonAuthorizationSchema> = CoreModels.ValueOf<
  AUTH['roles']
>;

type PermissionOf<AUTH extends TaonAuthorizationSchema> = CoreModels.ValueOf<
  AUTH['permissions']
>;

type RelationSelection<T extends string> = '*' | T[];

type GroupAndRolesTree<AUTH extends TaonAuthorizationSchema> = Partial<
  Record<GroupOf<AUTH>, RelationSelection<RoleOf<AUTH>>>
>;

type RolesAndPermissionsTree<AUTH extends TaonAuthorizationSchema> = Partial<
  Record<RoleOf<AUTH>, RelationSelection<PermissionOf<AUTH>>>
>;

export interface PersistAuthorizationTreeOptions<
  AUTH extends TaonAuthorizationSchema,
> {
  authorization: AUTH;

  tree: {
    groupAndRoles?: GroupAndRolesTree<AUTH>;
    rolesAndPermissions?: RolesAndPermissionsTree<AUTH>;
  };
}

//#endregion

@TaonRepository({
  className: 'TaonAuthContextRepository',
})
export class TaonAuthContextRepository<
  AUTH extends TaonAuthorizationSchema,
> extends TaonBaseCustomRepository {
  //#region fields & getters

  private readonly taonSessionUserRepository = this.injectCustomRepo(
    TaonSessionUserRepository,
  );

  private readonly taonSessionRepository = this.injectCustomRepo(
    TaonSessionRepository,
  );

  private readonly taonGroupRoleRepository = this.injectCustomRepo(
    TaonGroupRoleRepository,
  );

  private readonly taonRolePermissionRepository = this.injectCustomRepo(
    TaonRolePermissionRepository,
  );

  private readonly taonGroupRepository =
    this.injectCustomRepo(TaonGroupRepository);

  private readonly taonPermissionRepository = this.injectCustomRepo(
    TaonPermissionRepository,
  );

  private readonly taonSessionProvider =
    this.injectProvider(TaonSessionProvider);

  private readonly taonRoleRepository =
    this.injectCustomRepo(TaonRoleRepository);

  //#endregion

  //#region API / get context

  public async getContext(
    userId?: number | string,
    sessionId?: number | string,
  ): Promise<TaonAuthContextEntity<AUTH>> {
    //#region @websqlFunc

    const context = new TaonAuthContextEntity<AUTH>();

    context.user = !userId
      ? null
      : await this.taonSessionUserRepository.getUserById(userId);

    context.session = !userId
      ? null
      : await this.taonSessionRepository.getSessionBy(sessionId);

    context.groups = !userId
      ? []
      : (await this.taonGroupRepository.getGroupsForUserId(userId)).map(
          c => c.code as GroupOf<AUTH>,
        );

    context.roles = !userId
      ? []
      : (await this.taonRoleRepository.getRolesForUserId(userId)).map(
          c => c.code as RoleOf<AUTH>,
        );

    context.permissions = !userId
      ? []
      : (
          await this.taonPermissionRepository.getPermissionsForUserId(userId)
        ).map(c => c.code as PermissionOf<AUTH>);

    const userEmails = context.user?.identities?.map(c => c.email) || [];

    context.isSuperUser = this.taonSessionProvider.superUsersEmails.some(
      email => userEmails.includes(email),
    );

    context.isLocalhostBackend = !this.taonSessionProvider.isProduction;

    return context;

    //#endregion
  }

  //#endregion

  //#region API / clear roles groups permissions

  public async clearRolesGroupPermissions(): Promise<void> {
    //#region @websqlFunc

    await this.taonRolePermissionRepository.clear();
    await this.taonGroupRoleRepository.clear();

    await this.taonPermissionRepository.clear();
    await this.taonRoleRepository.clear();
    await this.taonGroupRepository.clear();

    //#endregion
  }

  //#endregion

  //#region API / persist tree

  public async persistTree(
    options: PersistAuthorizationTreeOptions<AUTH>,
  ): Promise<void> {
    //#region @websqlFunc

    const { authorization, tree } = options;

    const groups = Object.values(authorization.groups) as GroupOf<AUTH>[];

    const roles = Object.values(authorization.roles) as RoleOf<AUTH>[];

    const permissions = Object.values(
      authorization.permissions,
    ) as PermissionOf<AUTH>[];

    //#region persist all entities

    const groupByCode = new Map<
      GroupOf<AUTH>,
      Awaited<ReturnType<typeof this.getOrCreateGroup>>
    >();

    const roleByCode = new Map<
      RoleOf<AUTH>,
      Awaited<ReturnType<typeof this.getOrCreateRole>>
    >();

    const permissionByCode = new Map<
      PermissionOf<AUTH>,
      Awaited<ReturnType<typeof this.getOrCreatePermission>>
    >();

    for (const [name, code] of Object.entries(authorization.groups)) {
      groupByCode.set(
        code as GroupOf<AUTH>,
        await this.getOrCreateGroup(code as GroupOf<AUTH>, name),
      );
    }

    for (const [name, code] of Object.entries(authorization.roles)) {
      roleByCode.set(
        code as RoleOf<AUTH>,
        await this.getOrCreateRole(code as RoleOf<AUTH>, name),
      );
    }

    for (const [name, code] of Object.entries(authorization.permissions)) {
      permissionByCode.set(
        code as PermissionOf<AUTH>,
        await this.getOrCreatePermission(code as PermissionOf<AUTH>, name),
      );
    }

    //#endregion

    //#region group -> roles

    const groupAndRoles = tree.groupAndRoles;

    if (groupAndRoles) {
      for (const groupCode of groups) {
        const selection = groupAndRoles[groupCode];

        if (!selection) {
          continue;
        }

        const group = groupByCode.get(groupCode)!;

        const selectedRoles: RoleOf<AUTH>[] =
          selection === '*' ? roles : selection;

        for (const roleCode of selectedRoles) {
          const role = roleByCode.get(roleCode);

          if (!role) {
            throw new Error(
              `Role "${roleCode}" is not defined in authorization.roles.`,
            );
          }

          await this.assignRole(group, role);
        }
      }
    }

    //#endregion

    //#region role -> permissions

    const rolesAndPermissions = tree.rolesAndPermissions;

    if (rolesAndPermissions) {
      for (const roleCode of roles) {
        const selection = rolesAndPermissions[roleCode];

        if (!selection) {
          continue;
        }

        const role = roleByCode.get(roleCode)!;

        const selectedPermissions: PermissionOf<AUTH>[] =
          selection === '*' ? permissions : selection;

        for (const permissionCode of selectedPermissions) {
          const permission = permissionByCode.get(permissionCode);

          if (!permission) {
            throw new Error(
              `Permission "${permissionCode}" is not defined in authorization.permissions.`,
            );
          }

          await this.assignPermission(role, permission);
        }
      }
    }

    //#endregion

    //#endregion
  }

  //#endregion

  //#region methods / get or create group

  private async getOrCreateGroup(code: GroupOf<AUTH>, name: string) {
    //#region @websqlFunc

    let entity = await this.taonGroupRepository.findOne({
      where: {
        code,
      },
    });

    if (!entity) {
      entity = this.taonGroupRepository.create({
        code,
        name,
      });

      entity = await this.taonGroupRepository.save(entity);
    }

    return entity;

    //#endregion
  }

  //#endregion

  //#region methods / get or create role

  private async getOrCreateRole(code: RoleOf<AUTH>, name: string) {
    //#region @websqlFunc

    let entity = await this.taonRoleRepository.findOne({
      where: {
        code,
      },
    });

    if (!entity) {
      entity = this.taonRoleRepository.create({
        code,
        name,
      });

      entity = await this.taonRoleRepository.save(entity);
    }

    return entity;

    //#endregion
  }

  //#endregion

  //#region methods / get or create permission

  private async getOrCreatePermission(code: PermissionOf<AUTH>, name: string) {
    //#region @websqlFunc

    let entity = await this.taonPermissionRepository.findOne({
      where: {
        code,
      },
    });

    if (!entity) {
      entity = this.taonPermissionRepository.create({
        code,
        name,
      });

      entity = await this.taonPermissionRepository.save(entity);
    }

    return entity;

    //#endregion
  }

  //#endregion

  //#region methods / assign role

  private async assignRole(
    group: Awaited<ReturnType<typeof this.getOrCreateGroup>>,
    role: Awaited<ReturnType<typeof this.getOrCreateRole>>,
  ): Promise<void> {
    //#region @websqlFunc

    const exists = await this.taonGroupRoleRepository.exists({
      where: {
        groupId: group.id as any,
        roleId: role.id as any,
      },
    });

    if (exists) {
      return;
    }

    await this.taonGroupRoleRepository.save(
      this.taonGroupRoleRepository.create({
        groupId: group.id as any,
        roleId: role.id as any,
      }),
    );

    //#endregion
  }

  //#endregion

  //#region methods / assign permission

  private async assignPermission(
    role: Awaited<ReturnType<typeof this.getOrCreateRole>>,
    permission: Awaited<ReturnType<typeof this.getOrCreatePermission>>,
  ): Promise<void> {
    //#region @websqlFunc

    const exists = await this.taonRolePermissionRepository.exists({
      where: {
        roleId: role.id as any,
        permissionId: permission.id as any,
      },
    });

    if (exists) {
      return;
    }

    await this.taonRolePermissionRepository.save(
      this.taonRolePermissionRepository.create({
        roleId: role.id as any,
        permissionId: permission.id as any,
      }),
    );

    //#endregion
  }

  //#endregion
}
