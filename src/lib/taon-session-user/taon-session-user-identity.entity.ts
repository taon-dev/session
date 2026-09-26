import {
  BooleanColumn,
  Column,
  CreateDateColumn,
  Index,
  JoinColumn,
  ManyToOne,
  TaonBaseAbstractEntity,
  TaonEntity,
  UpdateDateColumn,
} from 'taon/src';

import { TaonSessionUserEntity } from '../taon-session-user/taon-session-user.entity';

import { TaonSessionIdentityProvider } from './taon-session-user.models';

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

  /**
   * PASSWORD / GOOGLE / MICROSOFT / APPLE / FACEBOOK
   */
  //#region @websql
  @Column({ type: 'varchar', length: 50 })
  //#endregion
  provider!: TaonSessionIdentityProvider;

  /**
   * PASSWORD:
   *   normalized email
   *
   * GOOGLE:
   *   Google's stable `sub`, NOT email
   *
   * Other OAuth providers:
   *   stable provider-specific account id
   */
  //#region @websql
  @Column({ type: 'varchar', length: 500 })
  //#endregion
  providerUserId!: string;

  /**
   * Convenience/contact email reported by this identity.
   *
   * Do NOT use this as the primary OAuth identity key.
   */
  //#region @websql
  @Column({ nullable: true, type: 'varchar', length: 500 })
  //#endregion
  email?: string;

  /**
   * Only PASSWORD identities have this.
   *
   * Never store plaintext here.
   */
  //#region @websql
  @Column({ nullable: true, type: 'varchar', length: 500 })
  //#endregion
  passwordHash?: string;

  //#region @websql
  @BooleanColumn(false)
  //#endregion
  isEmailVerified!: boolean;

  //#region @websql
  @CreateDateColumn()
  //#endregion
  createdAt!: Date;

  //#region @websql
  @UpdateDateColumn()
  //#endregion
  updatedAt!: Date;
}
