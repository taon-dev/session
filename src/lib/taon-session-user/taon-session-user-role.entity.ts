//#region imports
import { TaonSessionUser } from '../taon-session-user/taon-session-user.entity';
import { TaonRole } from '../taon-role/taon-role.entity';
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
  className: 'TaonSessionUserRole',
  createTable: true,
})
export class TaonSessionUserRole extends TaonBaseAbstractEntity<TaonSessionUserRole> {
  
//#region @websql
@Column()
//#endregion
  userId!: number;

  
//#region @websql
@Column()
//#endregion
  roleId!: number;

  
//#region @websql
@ManyToOne(() => TaonSessionUser, user => user.userRoles, {
    onDelete: 'CASCADE',
  })
//#endregion
  
//#region @websql
@JoinColumn({ name: 'userId' })
//#endregion
  user!: TaonSessionUser;

  
//#region @websql
@ManyToOne(() => TaonRole, role => role.userRoles, {
    onDelete: 'CASCADE',
  })
//#endregion
  
//#region @websql
@JoinColumn({ name: 'roleId' })
//#endregion
  role!: TaonRole;

  
//#region @websql
@CreateDateColumn()
//#endregion
  createdAt!: Date;
}