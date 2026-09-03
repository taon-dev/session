//#region imports
import {
  CustomColumn,
  String45Column,
  String500Column,
  Taon,
  TaonBaseAbstractEntity,
  TaonEntity,
} from 'taon/src';
import { _ } from 'tnp-core/src';

//#endregion

@TaonEntity({
  className: 'TaonSessionUser',
  createTable: true,
})
export class TaonSessionUser extends TaonBaseAbstractEntity<TaonSessionUser> {
  //#region @websql
  @String45Column()
  //#endregion
  email?: string;

  //#region @websql
  @String45Column()
  //#endregion
  username?: string;

  //#region @websql
  @String500Column()
  //#endregion
  password?: string;
}
