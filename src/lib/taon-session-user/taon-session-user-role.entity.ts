//#region imports
import { TaonSessionUserEntity } from '../taon-session-user/taon-session-user.entity';
import { TaonRoleEntity } from '../taon-role/taon-role.entity';
import {
  Column,
  CreateDateColumn,
  CustomColumn,
  JoinColumn,
  ManyToOne,
  String45Column,
  String500Column,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

//#endregion

@TaonEntity({
  className: 'TaonSessionUserRoleEntity',
  createTable: true,
})
export class TaonSessionUserRoleEntity extends TaonBaseAbstractEntity<TaonSessionUserRoleEntity> {
  //#region @websql
  @Column({ type: 'int' })
  //#endregion
  userId!: number;

  //#region @websql
  @Column({ type: 'int' })
  //#endregion
  roleId!: number;

  //#region @websql
  @ManyToOne(() => TaonSessionUserEntity, user => user.userRoles, {
    onDelete: 'CASCADE',
  })
  //#endregion

  //#region @websql
  @JoinColumn({ name: 'userId' })
  //#endregion
  user!: TaonSessionUserEntity;

  //#region @websql
  @ManyToOne(() => TaonRoleEntity, role => role.userRoles, {
    onDelete: 'CASCADE',
  })
  //#endregion

  //#region @websql
  @JoinColumn({ name: 'roleId' })
  //#endregion
  role!: TaonRoleEntity;

  //#region @websql
  @CreateDateColumn()
  //#endregion
  createdAt!: Date;
}
