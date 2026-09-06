//#region imports
import { TaonRole } from '../taon-role/taon-role.entity';
import { TaonGroup } from '../taon-group/taon-group.entity';
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
  className: 'TaonGroupRole',
  createTable: true,
})
export class TaonGroupRole extends TaonBaseAbstractEntity<TaonGroupRole> {
  
//#region @websql
@Column()
//#endregion
  groupId!: number;

  
//#region @websql
@Column()
//#endregion
  roleId!: number;

  
//#region @websql
@ManyToOne(() => TaonGroup, group => group.groupRoles, {
    onDelete: 'CASCADE',
  })
//#endregion
  
//#region @websql
@JoinColumn({ name: 'groupId' })
//#endregion
  group!: TaonGroup;

  
//#region @websql
@ManyToOne(() => TaonRole, role => role.groupRoles, {
    onDelete: 'CASCADE',
  })
//#endregion
  
//#region @websql
@JoinColumn({ name: 'roleId' })
//#endregion
  role!: TaonRole;
}