//#region imports
import {
  Column,
  CreateDateColumn,
  CustomColumn,
  Index,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonAuditEventsDefaultsValues } from './taon-audit-events.constants';
//#endregion

@TaonEntity({
  className: 'TaonAuditEventsEntity',
  createTable: true,
})
export class TaonAuditEventsEntity extends TaonBaseAbstractEntity<TaonAuditEventsEntity> {
  //#region @websql
  @Index()
  //#endregion

  //#region @websql
  @Column({ type: 'varchar' })
  //#endregion
  type!: string;

  /**
   * Who performed the action.
   */

  //#region @websql
  @Column({ nullable: true, type: 'int' })
  //#endregion
  actorUserId?: number;

  /**
   * Who/what was affected.
   */

  //#region @websql
  @Column({ nullable: true, type: 'varchar' })
  //#endregion
  targetType?: string;

  //#region @websql
  @Column({ nullable: true, type: 'varchar' })
  //#endregion
  targetId?: string;

  //#region @websql
  @Column({ nullable: true, type: 'int' })
  //#endregion
  sessionId?: number;

  //#region @websql
  @Column({ nullable: true, type: 'varchar' })
  //#endregion
  ip?: string;

  //#region @websql
  @Column({ nullable: true, type: 'varchar' })
  //#endregion
  userAgent?: string;

  //#region @websql
  @Column({ type: 'simple-json', nullable: true })
  //#endregion
  data?: Record<string, any>;

  //#region @websql
  @CreateDateColumn()
  //#endregion
  createdAt!: Date;
}
