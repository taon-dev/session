//#region imports
import { TaonRole } from '../taon-role/taon-role.entity';
import { TaonPermission } from '../taon-permission/taon-permission.entity';
import {
  Column,
  DateTimeColumn,
  JoinColumn,
  ManyToOne,
  StringColumn,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

//#endregion

@TaonEntity({
  className: 'TaonRolePermission',
  createTable: true,
})
export class TaonRolePermission extends TaonBaseAbstractEntity<TaonRolePermission> {
  
//#region @websql
@Column()
//#endregion
  roleId!: number;

  
//#region @websql
@Column()
//#endregion
  permissionId!: number;

  
//#region @websql
@ManyToOne(() => TaonRole, role => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
//#endregion
  
//#region @websql
@JoinColumn({ name: 'roleId' })
//#endregion
  role!: TaonRole;

  
//#region @websql
@ManyToOne(() => TaonPermission, permission => permission.rolePermissions, {
    onDelete: 'CASCADE',
  })
//#endregion
  
//#region @websql
@JoinColumn({ name: 'permissionId' })
//#endregion
  permission!: TaonPermission;
}