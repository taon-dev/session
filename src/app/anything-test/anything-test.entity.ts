//#region imports
import { TaonGroupRoleEntity } from '@taon-dev/session/src';
import {
  DateTimeColumn,
  OneToMany,
  StringColumn,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';


import { AnythingTestDefaultsValues } from './anything-test.constants';

@TaonEntity({
  className: 'AnythingTestEntity',
  createTable: true,
})
export class AnythingTestEntity extends TaonBaseAbstractEntity<AnythingTestEntity> {
  //#region @websql
  @StringColumn(AnythingTestDefaultsValues.description)
  //#endregion
  description?: string;

  //#region @websql
  @DateTimeColumn()
  //#endregion
  modificationDate?: string;


//#region @websql
@OneToMany(() => TaonGroupRoleEntity, x => x.group)
//#endregion
  groupRoles!: TaonGroupRoleEntity[];
}
