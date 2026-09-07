//#region imports
import {
  Column,
  DateTimeColumn,
  ManyToOne,
  StringColumn,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonNotificationEntity, TaonSessionUser } from '../index';

//#endregion

@TaonEntity({
  className: 'TaonNotificationRecipientEntity',
  createTable: true,
})
export class TaonNotificationRecipientEntity extends TaonBaseAbstractEntity<TaonNotificationRecipientEntity> {
  //#region @websql
  @Column()
  //#endregion
  notificationId!: number;

  //#region @websql
  @Column()
  //#endregion
  userId!: number;

  //#region @websql
  @ManyToOne(
    () => TaonNotificationEntity,
    notification => notification.recipients,
    {
      onDelete: 'CASCADE',
    },
  )
  //#endregion
  notification!: TaonNotificationEntity;

  //#region @websql
  @ManyToOne(() => TaonSessionUser, {
    onDelete: 'CASCADE',
  })
  //#endregion
  user!: TaonSessionUser;

  //#region @websql
  @Column({ type: 'datetime', nullable: true })
  //#endregion
  readAt?: Date;

  //#region @websql
  @Column({ type: 'datetime', nullable: true })
  //#endregion
  dismissedAt?: Date;

  //#region @websql
  @Column({ type: 'datetime', nullable: true })
  //#endregion
  deliveredAt?: Date;
}
