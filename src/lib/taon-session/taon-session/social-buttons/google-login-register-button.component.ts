import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { MatRippleModule } from '@angular/material/core'; // Optional: for Material ripple effect
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'google-login-register-button',
  standalone: true,
  imports: [CommonModule, MatRippleModule],
  templateUrl: './google-login-register-button.component.html',
})
export class GoogleLoginRegisterButtonComponent {
  t = t.for(this);

  @Output() googleSignIn = new EventEmitter<void>();

  onClick() {
    this.googleSignIn.emit();
  }
}
