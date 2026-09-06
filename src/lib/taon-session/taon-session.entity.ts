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

import { TaonSessionUser } from '../taon-session-user/taon-session-user.entity';

//#endregion

@TaonEntity({
  className: 'TaonSession',
  createTable: true,
})
export class TaonSession extends TaonBaseAbstractEntity<TaonSession> {
  
//#region @websql
@Column()
//#endregion
  userId!: number;

  
//#region @websql
@ManyToOne(() => TaonSessionUser, user => user.sessions, {
    onDelete: 'CASCADE',
  })
//#endregion
  
//#region @websql
@JoinColumn({ name: 'userId' })
//#endregion
  user!: TaonSessionUser;

  /**
   * Store HASH of session token, not raw token.
   */
  
//#region @websql
@Index({ unique: true })
//#endregion
  
//#region @websql
@Column()
//#endregion
  tokenHash!: string;

  
//#region @websql
@Column({ nullable: true })
//#endregion
  userAgent?: string;

  
//#region @websql
@Column({ nullable: true })
//#endregion
  ip?: string;

  
//#region @websql
@Column({ nullable: true })
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
@Column({ nullable: true })
//#endregion
  revokeReason?: string;

  
//#region @websql
@CreateDateColumn()
//#endregion
  createdAt!: Date;
}