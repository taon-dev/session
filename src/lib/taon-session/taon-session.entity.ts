//#region imports
import {
  Column,
  CreateDateColumn,
  DateTimeColumn,
  Index,
  JoinColumn,
  ManyToOne,
  StringColumn,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonSessionUserEntity } from '../taon-session-user/taon-session-user.entity';

//#endregion

@TaonEntity({
  className: 'TaonSessionEntity',
  createTable: true,
})
export class TaonSessionEntity extends TaonBaseAbstractEntity<TaonSessionEntity> {
  //#region @websql
  @Column({ type: 'int' })
  //#endregion
  userId!: number;

  //#region @websql
  @ManyToOne(() => TaonSessionUserEntity, user => user.sessions, {
    onDelete: 'CASCADE',
  })
  //#endregion

  //#region @websql
  @JoinColumn({ name: 'userId' })
  //#endregion
  user!: TaonSessionUserEntity;

  /**
   * Store HASH of session token, not raw token.
   */

  //#region @websql
  @Index({ unique: true })
  //#endregion

  //#region @websql
  @Column({ type: 'varchar' })
  //#endregion
  tokenHash!: string;

  //#region @websql
  @Column({ nullable: true, type: 'varchar' })
  //#endregion
  userAgent?: string;

  //#region @websql
  @Column({ nullable: true, type: 'varchar' })
  //#endregion
  ip?: string;

  //#region @websql
  @Column({ nullable: true, type: 'varchar' })
  //#endregion
  deviceName?: string;

  //#region @websql
  @Column({ type: 'datetime', nullable: true })
  //#endregion
  lastActivityAt?: Date;

  //#region @websql
  @Column({ type: 'datetime' })
  //#endregion
  expiresAt!: Date;

  //#region @websql
  @Column({ type: 'datetime', nullable: true })
  //#endregion
  revokedAt?: Date;

  //#region @websql
  @Column({ nullable: true, type: 'varchar' })
  //#endregion
  revokeReason?: string;

  //#region @websql
  @CreateDateColumn()
  //#endregion
  createdAt!: Date;
}
