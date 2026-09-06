//#region imports
import { TaonRolePermission } from '../taon-role/taon-role-permission.entity';
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

import { TaonPermissionDefaultsValues } from './taon-permission.constants';
//#endregion

@TaonEntity({
  className: 'TaonPermission',
  createTable: true,
})
export class TaonPermission extends TaonBaseAbstractEntity<TaonPermission> {
  /**
   * Examples:
   *
   * user.read
   * user.write
   * project.deploy
   * billing.invoice.read
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
@OneToMany(() => TaonRolePermission, x => x.permission)
//#endregion
  rolePermissions!: TaonRolePermission[];
}