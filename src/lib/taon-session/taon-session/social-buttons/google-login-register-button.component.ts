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
  template: `
    <button
      type="button"
      matRipple
      (click)="onClick()"
      class="flex w-full items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 rounded-full font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
      <!-- Google SVG Logo -->
      <svg
        class="w-5 h-5"
        viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.17 21.32 7.25 24 12 24z" />
        <path
          fill="#FBBC05"
          d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.1 0 9.8 0 12s.43 3.9 1.19 5.42l4.09-3.15z" />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.25 0 3.17 2.68 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
      </svg>
      <span class="text-sm font-semibold tracking-wide">{{
        t.gettext('Sign in with Google')
      }}</span>
    </button>
  `,
})
export class GoogleLoginRegisterButtonComponent {
  t = t.for(this);

  @Output() googleSignIn = new EventEmitter<void>();

  onClick() {
    this.googleSignIn.emit();
  }
}
