import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { TaonGroupDetailsComponent } from '../../taon-group/taon-group-backoffice/taon-group-details.component';
import { TaonPermissionDetailsComponent } from '../../taon-permission/taon-permission-backoffice/taon-permission-details.component';
import { TaonRoleDetailsComponent } from '../../taon-role/taon-role-backoffice/taon-role-details.component';
import { TaonSessionUserDetailsComponent } from '../../taon-session-user/taon-session-backoffice-users/taon-session-user-details.component';

import type { TaonBackofficeDetail } from './taon-backoffice-details.resolver';

@Component({
  selector: 'taon-backoffice-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    forwardRef(() => TaonSessionUserDetailsComponent),
    forwardRef(() => TaonGroupDetailsComponent),
    forwardRef(() => TaonRoleDetailsComponent),
    forwardRef(() => TaonPermissionDetailsComponent),
  ],
  template: `
    @if (detail$ | async; as detail) {
      @switch (detail.kind) {
        @case ('user') {
          <h2>User: {{ detail.entity.username }} (#{{ detail.entity.id }})</h2>
          <taon-session-user-details [user]="detail.entity"></taon-session-user-details>
        }
        @case ('group') {
          <h2>Group: {{ detail.entity.name }} (#{{ detail.entity.id }})</h2>
          <taon-group-details [group]="detail.entity"></taon-group-details>
        }
        @case ('role') {
          <h2>Role: {{ detail.entity.name }} (#{{ detail.entity.id }})</h2>
          <taon-role-details [role]="detail.entity"></taon-role-details>
        }
        @case ('permission') {
          <h2>Permission: {{ detail.entity.name }} (#{{ detail.entity.id }})</h2>
          <taon-permission-details [permission]="detail.entity"></taon-permission-details>
        }
      }
    }
  `,
})
export class TaonBackofficeDetailsPageComponent {
  readonly detail$ = inject(ActivatedRoute).data.pipe(
    map(data => data['detail'] as TaonBackofficeDetail),
  );
}
