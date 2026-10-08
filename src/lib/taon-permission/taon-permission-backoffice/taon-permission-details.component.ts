import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TaonBackofficeNavigationService } from '../../taon-session/taon-session-backoffice/taon-backoffice-navigation.service';
import { TaonPermissionViewEditComponent } from '../taon-permission-view-edit/taon-permission-view-edit.component';
import type { TaonPermissionEntity } from '../taon-permission.entity';

@Component({
  selector: 'taon-permission-details',
  template: `
    <a [routerLink]="navigation.detailsLink('permission', permission.id)">Permission details #{{ permission.id }}</a>
    <div class="permission-details__section">
      <h4 class="permission-details__section-title">Description</h4>
      <taon-permission-view-edit [permission]="permission"></taon-permission-view-edit>
    </div>
  `,
  styleUrls: ['./taon-permission-backoffice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TaonPermissionViewEditComponent],
  providers: [TaonBackofficeNavigationService],
})
export class TaonPermissionDetailsComponent {
  @Input({ required: true }) permission!: TaonPermissionEntity;

  readonly navigation = inject(TaonBackofficeNavigationService);
}
