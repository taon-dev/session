//#region imports
import {
  CustomColumn,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonPermissionDefaultsValues } from './taon-permission.constants';
//#endregion

@TaonEntity({
  className: 'TaonPermission',
  createTable: true,
})
export class TaonPermission extends TaonBaseAbstractEntity<TaonPermission> {
  //#region @websql
  @CustomColumn({
    type: 'varchar',
    length: 100,
    default: TaonPermissionDefaultsValues.description,
  })
  //#endregion
  description?: string;
}