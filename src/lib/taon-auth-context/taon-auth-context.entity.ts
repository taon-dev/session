//#region imports
import {
  DateTimeColumn,
  StringColumn,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

import { TaonAuthContextDefaultsValues } from './taon-auth-context.constants';
//#endregion

@TaonEntity({
  className: 'TaonAuthContext',
  createTable: true,
})
export class TaonAuthContext extends TaonBaseAbstractEntity<TaonAuthContext> {
  //#region @websql
  @StringColumn(TaonAuthContextDefaultsValues.description)
  //#endregion
  description?: string;

  //#region @websql
  @DateTimeColumn()
  //#endregion
  modificationDate?: string;
}