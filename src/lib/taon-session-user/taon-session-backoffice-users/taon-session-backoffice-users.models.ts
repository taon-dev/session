export namespace TaonSessionBackofficeUsersModels {
  export type AssignedGroupRoleRow = {
    roleId: number;
    name: string;
  };

  export type AssignedGroupRow = {
    userId: number;
    groupId: number;
    name: string;
    code: string;
    description?: string;
    roles: AssignedGroupRoleRow[];
  };
}
