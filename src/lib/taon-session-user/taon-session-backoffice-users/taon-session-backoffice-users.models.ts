export namespace TaonSessionBackofficeUsersModels {
  export type AssignedGroupPermissionRow = {
    permissionId: number;
    name: string;
    code: string;
    description?: string;
  };

  export type AssignedGroupRow = {
    userId: number;
    groupId: number;
    name: string;
    code: string;
    description?: string;
    permissions: AssignedGroupPermissionRow[];
  };
}
