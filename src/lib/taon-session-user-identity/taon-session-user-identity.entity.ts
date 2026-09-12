//#region imports
import { TaonSessionUserEntity } from '../taon-session-user/taon-session-user.entity';
import {
  BooleanColumn,
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
  className: 'TaonSessionUserIdentityEntity',
  createTable: true,
})
export class TaonSessionUserIdentityEntity extends TaonBaseAbstractEntity<TaonSessionUserIdentityEntity> {
  //#region @websql
  @Column({ type: 'int' })
  //#endregion
  userId!: number;

  //#region @websql
  @ManyToOne(() => TaonSessionUserEntity, user => user.identities, {
    onDelete: 'CASCADE',
  })
  //#endregion

  //#region @websql
  @JoinColumn({ name: 'userId' })
  //#endregion
  user!: TaonSessionUserEntity;

  //#region @websql
  @Column({ type: 'varchar', length: 20 })
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
  @Column({ type: 'varchar' })
  //#endregion
  providerUserId!: string;

  /**
   * Provider-reported email.
   *
   * Do NOT use this alone as identity.
   */

  //#region @websql
  @Column({ nullable: true, type: 'varchar' })
  //#endregion
  providerEmail?: string;

  //#region @websql
  @BooleanColumn(false)
  //#endregion
  providerEmailVerified!: boolean;

  /**
   * Only relevant for PASSWORD identity.
   */

  //#region @websql
  @Column({ nullable: true, type: 'varchar' })
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
