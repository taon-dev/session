//#region imports
import { Translation } from '@taon-dev/i18n/src';
import {
  getStatusCode,
  HttpStatusEnum,
  Taon,
  TaonBaseRepository,
  TaonRepository,
} from 'taon/src';

import { TaonGroupEntity } from '../taon-group/taon-group.entity';
import { TaonSessionProvider } from '../taon-session/taon-session.provider';

import { TaonSessionUserGroupEntity } from './taon-session-user-group.entity';
import { TaonSessionUserIdentityEntity } from './taon-session-user-identity.entity';
import { TaonSessionCoreGroups } from './taon-session-user.constants';
//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@TaonRepository({
  className: 'TaonSessionUserGroupRepository',
})
export class TaonSessionUserGroupRepository extends TaonBaseRepository<TaonSessionUserGroupEntity> {
  entityClassResolveFn: () => typeof TaonSessionUserGroupEntity = () =>
    TaonSessionUserGroupEntity;

  protected readonly sessionProvider = this.inject(TaonSessionProvider);

  async assignGroupToUser(
    userId: number,
    groupId: number,
  ): Promise<TaonSessionUserGroupEntity> {
    //#region @websqlFunc

    const existing = await this.findOne({
      where: {
        userId,
        groupId,
      },
    });

    if (existing) {
      return existing;
    }

    const userGroup = new TaonSessionUserGroupEntity().clone({
      userId,
      groupId,
    });

    return await this.save(userGroup);

    //#endregion
  }

  async unassignGroupFromUser(userId: number, groupId: number): Promise<void> {
    //#region @websqlFunc

    if (await this.isEnforcedAdministratorMembership(userId, groupId)) {
      Taon.error({
        context: 'unassignGroupFromUser',
        status: getStatusCode(HttpStatusEnum.CONFLICT),
        message: t.gettext(
          'This Administrator membership is enforced by provider configuration (administratorsEmails) and cannot be removed.',
        ),
      });
      return;
    }

    const existing = await this.findOne({
      where: {
        userId,
        groupId,
      },
    });

    if (!existing) {
      return;
    }

    await this.deleteById(existing.id);

    //#endregion
  }

  //#region API / configured administrators
  /**
   * Idempotently assigns the Administrator group when one of the user's
   * verified emails is listed in TaonSessionProvider.administratorsEmails.
   * Existing memberships of other users are never revoked.
   * @param identities optional already loaded identities (avoids a query)
   * @returns true when the user is a configured administrator
   */
  async ensureConfiguredAdministratorMembership(
    userId: number | string,
    identities?: Pick<TaonSessionUserIdentityEntity, 'email' | 'isEmailVerified'>[],
  ): Promise<boolean> {
    //#region @websqlFunc
    const numericUserId = Number(userId);
    if (!numericUserId || !this.configuredAdministratorEmails().size) {
      return false;
    }
    if (!(await this.isConfiguredAdministrator(numericUserId, identities))) {
      return false;
    }
    const group = await this.findAdministratorGroup();
    if (!group) {
      console.warn(
        `[taon-session] Administrator group "${TaonSessionCoreGroups.Administrator}" does not exist; configured administrator membership cannot be enforced.`,
      );
      return true;
    }
    await this.assignGroupToUser(numericUserId, group.id);
    return true;
    //#endregion
  }

  async isEnforcedAdministratorMembership(
    userId: number | string,
    groupId: number | string,
  ): Promise<boolean> {
    //#region @websqlFunc
    if (!this.configuredAdministratorEmails().size) {
      return false;
    }
    const group = await this.findAdministratorGroup();
    if (!group || group.id !== Number(groupId)) {
      return false;
    }
    return await this.isConfiguredAdministrator(Number(userId));
    //#endregion
  }

  private async isConfiguredAdministrator(
    userId: number,
    identities?: Pick<TaonSessionUserIdentityEntity, 'email' | 'isEmailVerified'>[],
  ): Promise<boolean> {
    //#region @websqlFunc
    const configured = this.configuredAdministratorEmails();
    if (!configured.size || !userId) {
      return false;
    }
    const userIdentities =
      identities ??
      (await this.connection.manager
        .getRepository<TaonSessionUserIdentityEntity>(
          TaonSessionUserIdentityEntity,
        )
        .find({
          select: { email: true, isEmailVerified: true },
          where: { userId, isEmailVerified: true },
        }));
    return userIdentities.some(
      identity =>
        identity.isEmailVerified === true &&
        configured.has(this.normalizeEmail(identity.email)),
    );
    //#endregion
  }

  private async findAdministratorGroup(): Promise<TaonGroupEntity | null> {
    //#region @websqlFunc
    return await this.connection.manager
      .getRepository<TaonGroupEntity>(TaonGroupEntity)
      .findOne({
        select: { id: true },
        where: { code: TaonSessionCoreGroups.Administrator },
      });
    //#endregion
  }

  private configuredAdministratorEmails(): Set<string> {
    return new Set(
      (this.sessionProvider.administratorsEmails ?? [])
        .map(email => this.normalizeEmail(email))
        .filter(Boolean),
    );
  }

  private normalizeEmail(email?: string | null): string {
    return String(email ?? '').trim().toLowerCase();
  }
  //#endregion
}
