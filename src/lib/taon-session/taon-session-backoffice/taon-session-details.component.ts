import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonBackofficeNavigationService } from './taon-backoffice-navigation.service';
import { TaonSessionBackofficeApiService } from './taon-session-backoffice.api.service';
import { TaonSessionBackofficeModels } from './taon-session-backoffice.models';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-session-details',
  templateUrl: './taon-session-details.component.html',
  styleUrls: ['./taon-session-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, RouterLink],
  providers: [
    TaonSessionBackofficeApiService,
    TaonBackofficeNavigationService,
  ],
})
export class TaonSessionDetailsComponent implements OnChanges {
  readonly t = t.for(this);

  @Input({ required: true }) sessionId!: number;

  @Input() detail?: TaonSessionBackofficeModels.SessionDetails;

  readonly taonBackofficeNavigationService = inject(TaonBackofficeNavigationService);

  private readonly taonSessionBackofficeApiService = inject(TaonSessionBackofficeApiService);

  readonly session = signal<TaonSessionBackofficeModels.SessionDetails | null>(null);

  readonly loading = signal(false);

  readonly error = signal('');

  private requestId = 0;

  ngOnChanges(): void {
    const requestId = ++this.requestId;
    this.session.set(this.detail ?? null);
    this.error.set('');
    this.loading.set(!this.detail);
    if (!this.detail) {
      void this.loadDetails(requestId);
    }
  }

  private async loadDetails(requestId: number): Promise<void> {
    try {
      const detail = await this.taonSessionBackofficeApiService.getSessionDetails(
        Number(this.sessionId),
      );
      if (requestId === this.requestId) {
        this.session.set(detail);
      }
    } catch (error) {
      if (requestId === this.requestId) {
        console.error('[session-details]', error);
        this.error.set(this.t.gettext('Unable to load session details.'));
      }
    } finally {
      if (requestId === this.requestId) {
        this.loading.set(false);
      }
    }
  }
}
