//#region imports
import {
  Column,
  CustomColumn,
  Index,
  OneToMany,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonGroupRoleEntity } from '../taon-group/taon-group-role.entity';
import { TaonSessionUserGroupEntity } from '../taon-session-user/taon-session-user-group.entity';

import { TaonGroupDefaultsValues } from './taon-group.constants';
//#endregion

@TaonEntity({
  className: 'TaonGroupEntity',
  createTable: true,
})
export class TaonGroupEntity extends TaonBaseAbstractEntity<TaonGroupEntity> {
  //#region @websql
  @Index({ unique: true })
  //#endregion

  //#region @websql
  @Column({ type: 'varchar' })
  //#endregion
  name!: string;

  //#region @websql
  @Column({ type: 'varchar', nullable: true })
  //#endregion
  description?: string;

  //#region @websql
  @OneToMany(() => TaonSessionUserGroupEntity, x => x.group)
  //#endregion
  userGroups!: TaonSessionUserGroupEntity[];

  //#region @websql
  @OneToMany(() => TaonGroupRoleEntity, x => x.group)
  //#endregion
  groupRoles!: TaonGroupRoleEntity[];
}
