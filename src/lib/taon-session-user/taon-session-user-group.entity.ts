//#region imports
import { TaonSessionUserEntity } from '../taon-session-user/taon-session-user.entity';
import { TaonGroupEntity } from '../taon-group/taon-group.entity';
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
  className: 'TaonSessionUserGroupEntity',
  createTable: true,
})
export class TaonSessionUserGroupEntity extends TaonBaseAbstractEntity<TaonSessionUserGroupEntity> {
  //#region @websql
  @Column({ type: 'int' })
  //#endregion
  userId!: number;

  //#region @websql
  @Column({ type: 'int' })
  //#endregion
  groupId!: number;

  //#region @websql
  @ManyToOne(() => TaonSessionUserEntity, user => user.userGroups, {
    onDelete: 'CASCADE',
  })
  //#endregion

  //#region @websql
  @JoinColumn({ name: 'userId' })
  //#endregion
  user!: TaonSessionUserEntity;

  //#region @websql
  @ManyToOne(() => TaonGroupEntity, group => group.userGroups, {
    onDelete: 'CASCADE',
  })
  //#endregion

  //#region @websql
  @JoinColumn({ name: 'groupId' })
  //#endregion
  group!: TaonGroupEntity;

  //#region @websql
  @CreateDateColumn()
  //#endregion
  createdAt!: Date;
}
