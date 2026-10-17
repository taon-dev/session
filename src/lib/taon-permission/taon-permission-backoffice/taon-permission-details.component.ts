import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonBackofficeNavigationService } from '../../taon-session/taon-session-backoffice/taon-backoffice-navigation.service';
import { TaonPermissionViewEditComponent } from '../taon-permission-view-edit/taon-permission-view-edit.component';
import type { TaonPermissionEntity } from '../taon-permission.entity';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-permission-details',
  template: `
    <a [routerLink]="navigation.detailsLink('permission', permission.id)">
      {{
        t.gettext('Permission details #[[ id ]]', { id: permission.id })
      }}
    </a>
    <div class="permission-details__section">
      <h4 class="permission-details__section-title">
        {{ t.gettext('Description') }}
      </h4>
      <taon-permission-view-edit
        [permission]="permission"></taon-permission-view-edit>
    </div>
  `,
  styleUrls: ['./taon-permission-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TaonPermissionViewEditComponent],
  providers: [TaonBackofficeNavigationService],
})
export class TaonPermissionDetailsComponent {
  readonly t = t.for(this);

  @Input({ required: true }) permission!: TaonPermissionEntity;

  readonly navigation = inject(TaonBackofficeNavigationService);
}
