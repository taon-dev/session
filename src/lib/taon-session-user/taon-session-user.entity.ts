//#region imports
import {
  BooleanColumn,
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

import { TaonSessionEntity } from '../taon-session/taon-session.entity';
import { TaonSessionUserGroupEntity } from '../taon-session-user/taon-session-user-group.entity';
import { TaonSessionUserIdentityEntity } from '../taon-session-user/taon-session-user-identity.entity';
import { TaonSessionUserRoleEntity } from '../taon-session-user/taon-session-user-role.entity';

//#endregion

@TaonEntity({
  className: 'TaonSessionUserEntity',
  createTable: true,
})
export class TaonSessionUserEntity extends TaonBaseAbstractEntity<TaonSessionUserEntity> {
  //#region @websql
  @Index({ unique: true })
  //#endregion

  //#region @websql
  @Column({ nullable: true, type: 'varchar' })
  //#endregion
  username?: string;

  //#region @websql
  @BooleanColumn(true)
  //#endregion
  isActive!: boolean;

  //#region @websql
  @CreateDateColumn()
  //#endregion
  createdAt!: Date;

  //#region @websql
  @UpdateDateColumn()
  //#endregion
  updatedAt!: Date;

  //#region @websql
  @OneToMany(() => TaonSessionEntity, session => session.user)
  //#endregion
  sessions!: TaonSessionEntity[];

  //#region @websql
  @OneToMany(() => TaonSessionUserIdentityEntity, identity => identity.user)
  //#endregion
  identities!: TaonSessionUserIdentityEntity[];

  //#region @websql
  @OneToMany(() => TaonSessionUserGroupEntity, x => x.user)
  //#endregion
  userGroups!: TaonSessionUserGroupEntity[];

  //#region @websql
  @OneToMany(() => TaonSessionUserRoleEntity, x => x.user)
  //#endregion
  userRoles!: TaonSessionUserRoleEntity[];
}
