//#region imports
import { TaonSessionUser } from '../taon-session-user/taon-session-user.entity';
import { TaonGroup } from '../taon-group/taon-group.entity';
import {
  Column,
  CreateDateColumn,
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
  className: 'TaonSessionUserGroup',
  createTable: true,
})
export class TaonSessionUserGroup extends TaonBaseAbstractEntity<TaonSessionUserGroup> {
  
//#region @websql
@Column()
//#endregion
  userId!: number;

  
//#region @websql
@Column()
//#endregion
  groupId!: number;

  
//#region @websql
@ManyToOne(() => TaonSessionUser, user => user.userGroups, {
    onDelete: 'CASCADE',
  })
//#endregion
  
//#region @websql
@JoinColumn({ name: 'userId' })
//#endregion
  user!: TaonSessionUser;

  
//#region @websql
@ManyToOne(() => TaonGroup, group => group.userGroups, {
    onDelete: 'CASCADE',
  })
//#endregion
  
//#region @websql
@JoinColumn({ name: 'groupId' })
//#endregion
  group!: TaonGroup;

  
//#region @websql
@CreateDateColumn()
//#endregion
  createdAt!: Date;
}