//#region imports
import {
  CustomColumn,
  Column,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonProfileDefaultsValues } from './taon-profile.constants';
//#endregion

@TaonEntity<TaonProfileEntity>({
  className: 'TaonProfileEntity',
  createTable: false,
  // defaultModelMapping: () => ({
  //   '': TaonProfileEntity,
  //   nestedObjectField: ClassField,
  //   nestedArrField: [ClassObjArrField],
  // }),
})
export class TaonProfileEntity extends TaonBaseAbstractEntity<TaonProfileEntity> {
  //#region @websql
  @CustomColumn({
    type: 'varchar',
    length: 100,
    default: TaonProfileDefaultsValues.description,
  })
  //#endregion
  description?: string;
}
