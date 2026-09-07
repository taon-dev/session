//#region imports
import {
  Column,
  CreateDateColumn,
  CustomColumn,
  ManyToOne,
  OneToMany,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonNotificationRecipientEntity, TaonSessionUser } from '../index';

import { TaonNotificationDefaultsValues } from './taon-notification.constants';
//#endregion

@TaonEntity({
  className: 'TaonNotificationEntity',
  createTable: true,
})
export class TaonNotificationEntity extends TaonBaseAbstractEntity<TaonNotificationEntity> {
  /**
   * Stable machine-readable code.
   *
   * video.processing.finished
   * auth.session.revoked
   * payment.success
   */

  //#region @websql
  @Column()
  //#endregion
  type!: string;

  //#region @websql
  @Column()
  //#endregion
  title!: string;

  //#region @websql
  @Column({ type: 'text', nullable: true })
  //#endregion
  message?: string;

  /**
   * Optional route/action.
   *
   * /projects/123
   * /videos/abc
   */

  //#region @websql
  @Column({ nullable: true })
  //#endregion
  actionUrl?: string;

  /**
   * Arbitrary strongly-typed-by-your-code payload.
   */

  //#region @websql
  @Column({ type: 'simple-json', nullable: true })
  //#endregion
  data?: Record<string, any>;

  //#region @websql
  @Column({ nullable: true })
  //#endregion
  createdByUserId?: number;

  //#region @websql
  @CreateDateColumn()
  //#endregion
  createdAt!: Date;

  //#region @websql
  @Column({ type: 'datetime', nullable: true })
  //#endregion
  expiresAt?: Date;

  //#region @websql
  @OneToMany(
    () => TaonNotificationRecipientEntity,
    recipient => recipient.notification,
  )
  //#endregion
  recipients!: TaonNotificationRecipientEntity[];
}
