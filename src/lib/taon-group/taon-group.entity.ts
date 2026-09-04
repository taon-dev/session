//#region imports
import {
  CustomColumn,
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
  @CustomColumn({
    type: 'varchar',
    length: 100,
    default: TaonGroupDefaultsValues.description,
  })
  //#endregion
  description?: string;
}