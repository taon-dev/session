//#region imports

import { TaonRolePermissionRepository } from '../taon-role/taon-role-permission.repository';
import { TaonGroupRoleRepository } from '../taon-group/taon-group-role.repository';

import { TaonBaseCustomRepository, TaonRepository } from 'taon/src';

import { TaonGroupRepository } from '../taon-group/taon-group.repository';
import { TaonPermissionRepository } from '../taon-permission/taon-permission.repository';
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

type EnumLike<T extends string> = Record<string, T>;

type RelationSelection<T extends string> = '*' | T[];

type GroupAndRolesTree<GROUP extends string, ROLE extends string> = Partial<
  Record<GROUP, RelationSelection<ROLE>>
>;

type RolesAndPermissionsTree<
  ROLE extends string,
  PERMISSION extends string,
> = Partial<Record<ROLE, RelationSelection<PERMISSION>>>;

export interface PersistAuthorizationTreeOptions<
  GROUP extends string,
  ROLE extends string,
  PERMISSION extends string,
> {
  enums: {
    groups: EnumLike<GROUP>;
    roles: EnumLike<ROLE>;
    permissions: EnumLike<PERMISSION>;
  };

  tree: {
    groupAndRoles?: GroupAndRolesTree<GROUP, ROLE>;

    rolesAndPermissions?: RolesAndPermissionsTree<ROLE, PERMISSION>;
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
  ): Promise<TaonAuthContextEntity<AUTH>> {
    //#region @websqlFunc

    const context = new TaonAuthContextEntity<AUTH>();

    context.user = !userId
      ? null
      : await this.taonSessionUserRepository.getUserById(userId);

    context.session = !userId
      ? null
      : await this.taonSessionRepository.getSessionBy(userId);

    context.groups = !userId
      ? []
      : (await this.taonGroupRepository.getGroupsForUserId(userId)).map(
          c => c.code as AUTH['group'],
        );

    context.roles = !userId
      ? []
      : (await this.taonRoleRepository.getRolesForUserId(userId)).map(
          c => c.code as AUTH['role'],
        );

    context.permissions = !userId
      ? []
      : (
          await this.taonPermissionRepository.getPermissionsForUserId(userId)
        ).map(c => c.code as AUTH['permission']);

    const userEmails = context.user?.identities?.map(c => c.email) || [];

    context.isSuperUser = this.taonSessionProvider.superUsersEmails.some(
      email => userEmails.includes(email),
    );

    context.isLocalhostBackend =
      this.ctx.frontendHostUri.host.includes('localhost:');

    return context;

    //#endregion
  }

  //#endregion

  //#region API / persist tree

  public async clearRolesGroupPermissions(): Promise<void> {
    //#region @websqlFunc

    // relations first because of foreign keys
    await this.taonRolePermissionRepository.clear();
    await this.taonGroupRoleRepository.clear();

    // entities
    await this.taonPermissionRepository.clear();
    await this.taonRoleRepository.clear();
    await this.taonGroupRepository.clear();

    //#endregion
  }

  //#region API / persist tree
  public async persistTree(
    options: PersistAuthorizationTreeOptions<
      AUTH['group'],
      AUTH['role'],
      AUTH['permission']
    >,
  ): Promise<void> {
    //#region @websqlFunc

    const { enums, tree } = options;

    const groups = Object.values(enums.groups) as AUTH['group'][];

    const roles = Object.values(enums.roles) as AUTH['role'][];

    const permissions = Object.values(
      enums.permissions,
    ) as AUTH['permission'][];

    //#region persist all entities

    const groupByCode = new Map<
      AUTH['group'],
      Awaited<ReturnType<typeof this.getOrCreateGroup>>
    >();

    const roleByCode = new Map<
      AUTH['role'],
      Awaited<ReturnType<typeof this.getOrCreateRole>>
    >();

    const permissionByCode = new Map<
      AUTH['permission'],
      Awaited<ReturnType<typeof this.getOrCreatePermission>>
    >();

    for (const [name, code] of Object.entries(enums.groups)) {
      groupByCode.set(code, await this.getOrCreateGroup(code, name));
    }

    for (const [name, code] of Object.entries(enums.roles)) {
      roleByCode.set(code, await this.getOrCreateRole(code, name));
    }

    for (const [name, code] of Object.entries(enums.permissions)) {
      permissionByCode.set(code, await this.getOrCreatePermission(code, name));
    }

    //#endregion

    //#region group -> roles

    const groupAndRoles = tree.groupAndRoles || {};

    for (const groupCode of groups) {
      const selection = groupAndRoles[groupCode as any];

      if (!selection) {
        continue;
      }

      const group = groupByCode.get(groupCode)!;

      const selectedRoles = selection === '*' ? roles : selection;

      for (const roleCode of selectedRoles) {
        const role = roleByCode.get(roleCode);

        if (!role) {
          throw new Error(`Role "${roleCode}" is not defined in roles enum.`);
        }

        await this.assignRole(group, role);
      }
    }

    //#endregion

    //#region role -> permissions

    const rolesAndPermissions = tree.rolesAndPermissions || {};

    for (const roleCode of roles) {
      const selection = rolesAndPermissions[roleCode as any];

      if (!selection) {
        continue;
      }

      const role = roleByCode.get(roleCode)!;

      const selectedPermissions = selection === '*' ? permissions : selection;

      for (const permissionCode of selectedPermissions) {
        const permission = permissionByCode.get(permissionCode);

        if (!permission) {
          throw new Error(
            `Permission "${permissionCode}" is not defined in permissions enum.`,
          );
        }

        await this.assignPermission(role, permission);
      }
    }

    //#endregion

    //#endregion
  }
  //#endregion

  //#endregion

  //#region methods / get or create group
  private async getOrCreateGroup(code: AUTH['group'], name: string) {
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
  private async getOrCreateRole(code: AUTH['role'], name: string) {
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
  private async getOrCreatePermission(code: AUTH['permission'], name: string) {
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

  //#region assign role

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

  //#region assign permission

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
