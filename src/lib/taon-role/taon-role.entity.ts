//#region imports
import {
  CustomColumn,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonRoleDefaultsValues } from './taon-role.constants';
//#endregion

@TaonEntity({
  className: 'TaonRole',
  createTable: true,
})
export class TaonRole extends TaonBaseAbstractEntity<TaonRole> {
  //#region @websql
  @CustomColumn({
    type: 'varchar',
    length: 100,
    default: TaonRoleDefaultsValues.description,
  })
  //#endregion
  description?: string;
}