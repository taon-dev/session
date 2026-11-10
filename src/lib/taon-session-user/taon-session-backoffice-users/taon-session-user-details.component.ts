//#region imports
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  forwardRef,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MtxGridColumn } from '@ng-matero/extensions/grid';
import { TaonDatatableComponent } from '@taon-dev/ui/src';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

import { TaonGroupApiService } from '../../taon-group/taon-group-api.service';
import { TaonGroupChooserComponent } from '../../taon-group/taon-group-chooser/taon-group-chooser.component';
import type { TaonGroupEntity } from '../../taon-group/taon-group.entity';
import { TaonProfilePictureComponent } from '../../taon-session/taon-profile/taon-profile-picture/taon-profile-picture.component';
import { TaonBackofficeNavigationService } from '../../taon-session/taon-session-backoffice/taon-backoffice-navigation.service';
import { TaonSessionApiService } from '../../taon-session/taon-session.api.service';
import { TaonSessionUserApiService } from '../taon-session-user-api.service';
import type { TaonSessionUserEntity } from '../taon-session-user.entity';

import { TaonSessionBackofficeUsersModels } from './taon-session-backoffice-users.models';
import { of } from 'rxjs';
//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@Component({
  selector: 'taon-session-user-details',
  templateUrl: './taon-session-user-details.component.html',
  styleUrls: ['./taon-session-backoffice-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    TaonDatatableComponent,
    TaonGroupChooserComponent,
    TaonProfilePictureComponent,
  ],
  providers: [
    TaonGroupApiService,
    TaonBackofficeNavigationService,
    forwardRef(() => TaonSessionApiService),
    TaonSessionUserApiService,
  ],
})
export class TaonSessionUserDetailsComponent implements OnChanges {
  readonly t = t.for(this);

  @Input({ required: true }) user!: TaonSessionUserEntity;

  readonly navigation = inject(TaonBackofficeNavigationService);

  readonly taonSessionApiService = inject(TaonSessionApiService);

  readonly userApiService = inject(TaonSessionUserApiService);

  context$ = this.taonSessionApiService.context();

  readonly accountStatus = signal<'active' | 'inactive' | 'temporary'>('active');

  readonly temporaryDays = signal(7);

  readonly statusError = signal('');

  readonly groupError = signal('');

  readonly savingStatus = signal(false);

  ngOnChanges(): void {
    const inactiveUntil = this.user.inactiveUntil
      ? new Date(this.user.inactiveUntil).getTime()
      : 0;
    this.accountStatus.set(
      this.user.isActive || (inactiveUntil > 0 && inactiveUntil <= Date.now())
        ? 'active'
        : inactiveUntil > Date.now()
          ? 'temporary'
          : 'inactive',
    );
    if (inactiveUntil > Date.now()) {
      this.temporaryDays.set(
        Math.max(1, Math.ceil((inactiveUntil - Date.now()) / 86_400_000)),
      );
    }
    void this.loadGroupsForUser(Number(this.user.id));
  }
  //#region inject

  protected readonly taonGroupApiService = inject(TaonGroupApiService);

  //#endregion

  //#region state

  readonly groupRowsByUserId = signal<
    Record<number, TaonSessionBackofficeUsersModels.AssignedGroupRow[]>
  >({});

  readonly groupChooserUserId = signal<number | undefined>(undefined);

  /**
   * Stable reference, so that nested datatables do not reload on every
   * change detection cycle while groups are not loaded yet.
   */
  protected readonly emptyGroupRows: TaonSessionBackofficeUsersModels.AssignedGroupRow[] =
    [];

  protected readonly emptyIds: number[] = [];

  protected readonly assignedGroupIdsByUserId = signal<Record<number, number[]>>(
    {},
  );

  //#endregion

  //#region columns

  identityColumns: MtxGridColumn[] = [
    {
      header: this.t.gettext('Provider'),
      field: 'provider',
    },
    {
      header: this.t.gettext('Email'),
      field: 'email',
    },
  ];

  groupColumns: MtxGridColumn[] = [
    {
      header: this.t.gettext('ID'),
      field: 'groupId',
      showExpand: true,
    },
    {
      header: this.t.gettext('Name'),
      field: 'name',
    },
    {
      header: this.t.gettext('Code'),
      field: 'code',
    },
    {
      header: this.t.gettext('Description'),
      field: 'description',
    },
    {
      header: this.t.gettext('Actions'),
      field: 'actions',
      type: 'button',
      buttons: [
        {
          type: 'icon',
          icon: 'open_in_new',
          tooltip: this.t.gettext('Group details'),
          click: (row: TaonSessionBackofficeUsersModels.AssignedGroupRow) =>
            this.navigation.openDetails('group', row.groupId),
        },
        {
          type: 'icon',
          icon: 'delete',
          color: 'warn',
          tooltip: this.t.gettext('Remove group from user'),
          click: (row: TaonSessionBackofficeUsersModels.AssignedGroupRow) =>
            void this.unassignGroup(row),
        },
      ],
    },
  ];

  //#endregion

  //#region methods

  groupRowsFor(
    userId: number,
  ): TaonSessionBackofficeUsersModels.AssignedGroupRow[] {
    return this.groupRowsByUserId()[userId] ?? this.emptyGroupRows;
  }

  assignedGroupIds(userId: number): number[] {
    return this.assignedGroupIdsByUserId()[userId] ?? this.emptyIds;
  }

  openGroupChooser(userId: number): void {
    this.groupChooserUserId.set(userId);
  }

  closeGroupChooser(): void {
    this.groupChooserUserId.set(undefined);
  }

  groupAssigned(userId: number): void {
    this.closeGroupChooser();

    void this.loadGroupsForUser(userId);
  }

  setAccountStatus(status: 'active' | 'inactive' | 'temporary'): void {
    this.accountStatus.set(status);
    this.statusError.set('');
    if (status !== 'temporary') {
      void this.saveAccountStatus();
    }
  }

  setTemporaryDays(event: Event): void {
    const days = Number((event.target as HTMLInputElement).value);
    this.temporaryDays.set(Number.isSafeInteger(days) ? days : 0);
  }

  async saveAccountStatus(): Promise<void> {
    const status = this.accountStatus();
    const days = this.temporaryDays();
    if (status === 'temporary' && (!Number.isSafeInteger(days) || days < 1)) {
      this.statusError.set(this.t.gettext('Enter a number of days greater than zero.'));
      return;
    }
    this.savingStatus.set(true);
    this.statusError.set('');
    try {
      const updated = await this.userApiService.setAccountStatus(
        Number(this.user.id),
        status === 'temporary' ? { status, days } : { status },
      );
      this.user = updated;
    } catch (error) {
      console.error('[session-users] Unable to update account status', error);
      this.statusError.set(
        error instanceof Error
          ? error.message
          : this.t.gettext('Unable to update the user account status.'),
      );
    } finally {
      this.savingStatus.set(false);
    }
  }

  async loadGroupsForUser(userId: number): Promise<void> {
    if (!userId) {
      return;
    }

    const groups = await this.taonGroupApiService.getGroupsForUser(userId);

    const rows = groups.map(group => ({
      userId,
      groupId: group.id as number,
      name: group.name,
      code: group.code,
      description: group.description,
      roles: this.roleRowsFromGroup(group),
    }));

    this.groupRowsByUserId.set({
      ...this.groupRowsByUserId(),
      [userId]: rows,
    });

    this.assignedGroupIdsByUserId.set({
      ...this.assignedGroupIdsByUserId(),
      [userId]: rows.map(row => row.groupId),
    });
  }

  async unassignGroup(
    row: TaonSessionBackofficeUsersModels.AssignedGroupRow,
  ): Promise<void> {
    this.groupError.set('');
    try {
      await this.taonGroupApiService.unassignGroupFromUser(
        row.userId,
        row.groupId,
      );
    } catch (error) {
      console.error('[session-users] Unable to unassign group', error);
      this.groupError.set(
        (error as any)?.body?.json?.message ||
          this.t.gettext('Unable to remove the group from this user.'),
      );
    }

    await this.loadGroupsForUser(row.userId);
  }

  //#endregion

  //#region private methods

  private roleRowsFromGroup(
    group: TaonGroupEntity,
  ): TaonSessionBackofficeUsersModels.AssignedGroupRoleRow[] {
    const rolesById = new Map<
      number,
      TaonSessionBackofficeUsersModels.AssignedGroupRoleRow
    >();

    for (const groupRole of group.groupRoles ?? []) {
      const role = groupRole.role;
      if (role) {
        rolesById.set(Number(role.id), {
          roleId: Number(role.id),
          name: role.name,
        });
      }
    }

    return [...rolesById.values()];
  }

  //#endregion
}
