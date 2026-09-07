//#region imports
import { TaonRolePermissionEntity } from '../taon-role/taon-role-permission.entity';
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
  className: 'TaonPermissionEntity',
  createTable: true,
})
export class TaonPermissionEntity extends TaonBaseAbstractEntity<TaonPermissionEntity> {
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
@OneToMany(() => TaonRolePermissionEntity, x => x.permission)
//#endregion
  rolePermissions!: TaonRolePermissionEntity[];
}
