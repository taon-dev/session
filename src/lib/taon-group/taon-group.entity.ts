//#region imports
import { TaonSessionUserGroup } from '../taon-session-user/taon-session-user-group.entity';
import { TaonGroupRole } from '../taon-group/taon-group-role.entity';
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


import { TaonGroupDefaultsValues } from './taon-group.constants';
//#endregion

@TaonEntity({
  className: 'TaonGroup',
  createTable: true,
})
export class TaonGroup extends TaonBaseAbstractEntity<TaonGroup> {
  
//#region @websql
@Index({ unique: true })
//#endregion
  
//#region @websql
@Column()
//#endregion
  name!: string;

  
//#region @websql
@Column({ nullable: true })
//#endregion
  description?: string;

  
//#region @websql
@OneToMany(() => TaonSessionUserGroup, x => x.group)
//#endregion
  userGroups!: TaonSessionUserGroup[];

  
//#region @websql
@OneToMany(() => TaonGroupRole, x => x.group)
//#endregion
  groupRoles!: TaonGroupRole[];
}