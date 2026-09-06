//#region imports
import { TaonGroupRole } from '@taon-dev/session/src';
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
  className: 'AnythingTest',
  createTable: true,
})
export class AnythingTest extends TaonBaseAbstractEntity<AnythingTest> {
  //#region @websql
  @StringColumn(AnythingTestDefaultsValues.description)
  //#endregion
  description?: string;

  //#region @websql
  @DateTimeColumn()
  //#endregion
  modificationDate?: string;

  
//#region @websql
@OneToMany(() => TaonGroupRole, x => x.group)
//#endregion
  groupRoles!: TaonGroupRole[];
}