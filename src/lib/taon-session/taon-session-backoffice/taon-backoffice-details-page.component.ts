import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Translation } from '@taon-dev/i18n/src';
import { map } from 'rxjs';
import { Taon } from 'taon/src';

import { TaonGroupDetailsComponent } from '../../taon-group/taon-group-backoffice/taon-group-details.component';
import { TaonPermissionDetailsComponent } from '../../taon-permission/taon-permission-backoffice/taon-permission-details.component';
import { TaonRoleDetailsComponent } from '../../taon-role/taon-role-backoffice/taon-role-details.component';
import { TaonSessionUserDetailsComponent } from '../../taon-session-user/taon-session-backoffice-users/taon-session-user-details.component';

import type { TaonBackofficeDetail } from './taon-backoffice-details.resolver';
import { TaonSessionDetailsComponent } from './taon-session-details.component';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-backoffice-details-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    forwardRef(() => TaonSessionUserDetailsComponent),
    forwardRef(() => TaonGroupDetailsComponent),
    forwardRef(() => TaonRoleDetailsComponent),
    forwardRef(() => TaonPermissionDetailsComponent),
    forwardRef(() => TaonSessionDetailsComponent),
  ],
  template: `
    @if (detail$ | async; as detail) {
      @switch (detail.kind) {
        @case ('session') {
          <h2>{{ t.gettext('Session #[[ id ]]', { id: detail.entity.id }) }}</h2>
          <taon-session-details
            [sessionId]="detail.entity.id"
            [detail]="detail.entity"></taon-session-details>
        }
        @case ('user') {
          <h2>
            {{
              t.gettext('User: [[ username ]] (#[[ id ]])', {
                username: detail.entity.username,
                id: detail.entity.id,
              })
            }}
          </h2>
          <taon-session-user-details
            [user]="detail.entity"></taon-session-user-details>
        }
        @case ('group') {
          <h2>
            {{
              t.gettext('Group: [[ name ]] (#[[ id ]])', {
                name: detail.entity.name,
                id: detail.entity.id,
              })
            }}
          </h2>
          <taon-group-details [group]="detail.entity"></taon-group-details>
        }
        @case ('role') {
          <h2>
            {{
              t.gettext('Role: [[ name ]] (#[[ id ]])', {
                name: detail.entity.name,
                id: detail.entity.id,
              })
            }}
          </h2>
          <taon-role-details [role]="detail.entity"></taon-role-details>
        }
        @case ('permission') {
          <h2>
            {{
              t.gettext('Permission: [[ name ]] (#[[ id ]])', {
                name: detail.entity.name,
                id: detail.entity.id,
              })
            }}
          </h2>
          <taon-permission-details
            [permission]="detail.entity"></taon-permission-details>
        }
      }
    }
  `,
})
export class TaonBackofficeDetailsPageComponent {
  readonly t = t.for(this);

  readonly detail$ = inject(ActivatedRoute).data.pipe(
    map(data => data['detail'] as TaonBackofficeDetail),
  );
}
