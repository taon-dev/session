//#region imports
import { TaonSessionUserRoleEntity } from '../taon-session-user/taon-session-user-role.entity';
import { TaonRolePermissionEntity } from '../taon-role/taon-role-permission.entity';
import { TaonGroupRoleEntity } from '../taon-group/taon-group-role.entity';
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
  className: 'TaonRoleEntity',
  createTable: true,
})
export class TaonRoleEntity extends TaonBaseAbstractEntity<TaonRoleEntity> {
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
@OneToMany(() => TaonSessionUserRoleEntity, x => x.role)
//#endregion
  userRoles!: TaonSessionUserRoleEntity[];


//#region @websql
@OneToMany(() => TaonGroupRoleEntity, x => x.role)
//#endregion
  groupRoles!: TaonGroupRoleEntity[];


//#region @websql
@OneToMany(() => TaonRolePermissionEntity, x => x.role)
//#endregion
  rolePermissions!: TaonRolePermissionEntity[];
}
