//#region imports
import { TaonSessionUserRole } from '../taon-session-user/taon-session-user-role.entity';
import { TaonRolePermission } from '../taon-role/taon-role-permission.entity';
import { TaonGroupRole } from '../taon-group/taon-group-role.entity';
import {
  Column,
  CustomColumn,
  Index,
  OneToMany,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';


import { TaonRoleDefaultsValues } from './taon-role.constants';
//#endregion

@TaonEntity({
  className: 'TaonRole',
  createTable: true,
})
export class TaonRole extends TaonBaseAbstractEntity<TaonRole> {
  /**
   * Example:
   * admin
   * editor
   * billing-manager
   */
  
//#region @websql
@Index({ unique: true })
//#endregion
  
//#region @websql
@Column()
//#endregion
  name!: string;

  
//#region @websql
@Column({ nullable: true })
//#endregion
  description?: string;

  
//#region @websql
@OneToMany(() => TaonSessionUserRole, x => x.role)
//#endregion
  userRoles!: TaonSessionUserRole[];

  
//#region @websql
@OneToMany(() => TaonGroupRole, x => x.role)
//#endregion
  groupRoles!: TaonGroupRole[];

  
//#region @websql
@OneToMany(() => TaonRolePermission, x => x.role)
//#endregion
  rolePermissions!: TaonRolePermission[];
}