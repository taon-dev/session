//#region imports
import { Taon, TaonBaseClass, TaonBaseProvider, TaonProvider } from 'taon/src';
import { _ } from 'tnp-core/src';
//#endregion

export class TaonTaonProfileConfig extends TaonBaseClass {
  declare name: string;
}

@TaonProvider({
  className: 'TaonProfileProvider',
})
export class TaonProfileProvider extends TaonBaseProvider {
  enabledTaonProfileOption: boolean = true;

  config = new TaonTaonProfileConfig();

  clone() {
    return {
      enabledTaonProfileOption: this.enabledTaonProfileOption,
      config: this.config.clone(),
    };
  }
}
