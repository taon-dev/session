//#region imports
import { TaonRoleEntity } from '../taon-role/taon-role.entity';
import { TaonGroupEntity } from '../taon-group/taon-group.entity';
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
  className: 'TaonGroupRoleEntity',
  createTable: true,
})
export class TaonGroupRoleEntity extends TaonBaseAbstractEntity<TaonGroupRoleEntity> {

//#region @websql
@Column()
//#endregion
  groupId!: number;


//#region @websql
@Column()
//#endregion
  roleId!: number;


//#region @websql
@ManyToOne(() => TaonGroupEntity, group => group.groupRoles, {
    onDelete: 'CASCADE',
  })
//#endregion

//#region @websql
@JoinColumn({ name: 'groupId' })
//#endregion
  group!: TaonGroupEntity;


//#region @websql
@ManyToOne(() => TaonRoleEntity, role => role.groupRoles, {
    onDelete: 'CASCADE',
  })
//#endregion

//#region @websql
@JoinColumn({ name: 'roleId' })
//#endregion
  role!: TaonRoleEntity;
}
