//#region imports
import { TaonRoleEntity } from '../taon-role/taon-role.entity';
import { TaonPermissionEntity } from '../taon-permission/taon-permission.entity';
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
  className: 'TaonRolePermissionEntity',
  createTable: true,
})
export class TaonRolePermissionEntity extends TaonBaseAbstractEntity<TaonRolePermissionEntity> {

//#region @websql
@Column()
//#endregion
  roleId!: number;


//#region @websql
@Column()
//#endregion
  permissionId!: number;


//#region @websql
@ManyToOne(() => TaonRoleEntity, role => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
//#endregion

//#region @websql
@JoinColumn({ name: 'roleId' })
//#endregion
  role!: TaonRoleEntity;


//#region @websql
@ManyToOne(() => TaonPermissionEntity, permission => permission.rolePermissions, {
    onDelete: 'CASCADE',
  })
//#endregion

//#region @websql
@JoinColumn({ name: 'permissionId' })
//#endregion
  permission!: TaonPermissionEntity;
}
