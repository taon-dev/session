//#region imports
import { TaonSessionUser } from '../taon-session-user/taon-session-user.entity';
import {
  Column,
  CreateDateColumn,
  CustomColumn,
  JoinColumn,
  ManyToOne,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
  UpdateDateColumn,
} from 'taon/src';
import { _ } from 'tnp-core/src';

export enum UserIdentityExternal {
  PASSWORD = 'password',
  GOOGLE = 'google',
  GITHUB = 'github',
  MICROSOFT = 'microsoft',
}


import { TaonSessionUserIdentityDefaultsValues } from './taon-session-user-identity.constants';
//#endregion

@TaonEntity({
  className: 'TaonSessionUserIdentity',
  createTable: true,
})
export class TaonSessionUserIdentity extends TaonBaseAbstractEntity<TaonSessionUserIdentity> {
  
//#region @websql
@Column()
//#endregion
  userId!: number;

  
//#region @websql
@ManyToOne(() => TaonSessionUser, user => user.identities, {
    onDelete: 'CASCADE',
  })
//#endregion
  
//#region @websql
@JoinColumn({ name: 'userId' })
//#endregion
  user!: TaonSessionUser;

  
//#region @websql
@Column()
//#endregion
  provider!: UserIdentityExternal;

  /**
   * For Google:
   * Google's stable `sub`.
   *
   * For GitHub:
   * GitHub user ID.
   *
   * For local password:
   * you could use User.id/string identifier.
   */
  
//#region @websql
@Column()
//#endregion
  providerUserId!: string;

  /**
   * Provider-reported email.
   *
   * Do NOT use this alone as identity.
   */
  
//#region @websql
@Column({ nullable: true })
//#endregion
  providerEmail?: string;

  
//#region @websql
@Column({ default: false })
//#endregion
  providerEmailVerified!: boolean;

  /**
   * Only relevant for PASSWORD identity.
   */
  
//#region @websql
@Column({ nullable: true })
//#endregion
  passwordHash?: string;

  
//#region @websql
@CreateDateColumn()
//#endregion
  createdAt!: Date;

  
//#region @websql
@UpdateDateColumn()
//#endregion
  updatedAt!: Date;
}