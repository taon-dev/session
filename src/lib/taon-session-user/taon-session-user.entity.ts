//#region imports
import { TaonSessionUserRole } from '../taon-session-user/taon-session-user-role.entity';
import { TaonSessionUserIdentity } from '../taon-session-user-identity/taon-session-user-identity.entity';
import { TaonSessionUserGroup } from '../taon-session-user/taon-session-user-group.entity';
import { TaonSession } from '../taon-session/taon-session.entity';
import {
  Column,
  CreateDateColumn,
  CustomColumn,
  Index,
  OneToMany,
  String45Column,
  String500Column,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
  UpdateDateColumn,
} from 'taon/src';
import { _ } from 'tnp-core/src';


//#endregion

@TaonEntity({
  className: 'TaonSessionUser',
  createTable: true,
})
export class TaonSessionUser extends TaonBaseAbstractEntity<TaonSessionUser> {
  
//#region @websql
@Index({ unique: true })
//#endregion
  
//#region @websql
@Column({ nullable: true })
//#endregion
  email?: string;

  
//#region @websql
@Index({ unique: true })
//#endregion
  
//#region @websql
@Column({ nullable: true })
//#endregion
  username?: string;

  
//#region @websql
@Column({ default: true })
//#endregion
  isActive!: boolean;

  
//#region @websql
@Column({ default: false })
//#endregion
  isEmailVerified!: boolean;

  
//#region @websql
@Column({ type: 'varchar', length: 200 })
//#endregion
  password!: string;

  
//#region @websql
@CreateDateColumn()
//#endregion
  createdAt!: Date;

  
//#region @websql
@UpdateDateColumn()
//#endregion
  updatedAt!: Date;

  
//#region @websql
@OneToMany(() => TaonSession, session => session.user)
//#endregion
  sessions!: TaonSession[];

  
//#region @websql
@OneToMany(() => TaonSessionUserIdentity, identity => identity.user)
//#endregion
  identities!: TaonSessionUserIdentity[];

  
//#region @websql
@OneToMany(() => TaonSessionUserGroup, x => x.user)
//#endregion
  userGroups!: TaonSessionUserGroup[];

  
//#region @websql
@OneToMany(() => TaonSessionUserRole, x => x.user)
//#endregion
  userRoles!: TaonSessionUserRole[];
}