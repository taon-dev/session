import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'; // browser

import { TaonLoginErrors, TaonSessionState } from './taon-session.models';

export namespace TaonSessionValidator {
  //#region @browser
  export const passwordMatchValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const password = control.get('password');
    const passwordRepeat = control.get('passwordRepeat');
    const state = control.get('state');
    if (state.value !== TaonSessionState.ENTER_REGISTRATION_PASSWORDS) {
      return null;
    }

    if (!password || !passwordRepeat) {
      return null;
    }

    return password.value === passwordRepeat.value
      ? null
      : { [TaonLoginErrors.PASSWORDS_DO_NOT_MATCH]: true };
  };
  //#endregion
}
