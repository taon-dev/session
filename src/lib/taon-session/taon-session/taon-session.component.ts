//#region imports
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { BehaviorSubject, finalize, switchMap, tap } from 'rxjs';

import { TaonSessionApiService } from '../taon-session-api.service';
import { TaonSession } from '../taon-session.models';
//#endregion

@Component({
  selector: 'app-taon-session',
  templateUrl: './taon-session.component.html',
  styleUrls: ['./taon-session.component.scss'],
  providers: [TaonSessionApiService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    RouterOutlet,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
  ],
})
export class TaonSessionComponent {
  taonSessionApiService = inject(TaonSessionApiService);

  refreshSrc = new BehaviorSubject(void 0);

  email = TaonSession.DEFAULT_EMAIL;

  password = TaonSession.DEFAULT_PASSWORD;

  userId: string;

  userId$ = this.refreshSrc.asObservable().pipe(
    switchMap(() => this.taonSessionApiService.me()),
    tap(userId => (this.userId = userId)),
  );

  loading = false;

  reloadMe(): void {
    this.refreshSrc.next(void 0);
  }

  login(): void {
    this.loading = true;
    this.taonSessionApiService
      .login(this.email, this.password)
      .pipe(
        finalize(() => {
          this.refreshSrc.next(void 0);
          this.loading = false;
        }),
      )
      .subscribe();
  }

  logout(): void {
    this.loading = true;
    this.taonSessionApiService
      .logout()
      .pipe(
        finalize(() => {
          this.refreshSrc.next(void 0);
          this.loading = false;
        }),
      )
      .subscribe();
  }
}
