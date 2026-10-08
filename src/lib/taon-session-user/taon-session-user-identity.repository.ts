import { Translation } from '@taon-dev/i18n/src';
import { getStatusCode, HttpStatusEnum, Taon, TaonBaseRepository, TaonRepository } from 'taon/src';
import type { EntityManager } from 'taon-typeorm/src';
import { UtilsPasswords } from 'tnp-helpers/src';

import { TaonSessionProvider } from '../taon-session/taon-session.provider';

import { TaonSessionUserIdentityEntity } from './taon-session-user-identity.entity';
import { TaonSessionUserEntity } from './taon-session-user.entity';
import { TaonSessionIdentityProvider } from './taon-session-user.models';
import { TaonSessionUserRepository } from './taon-session-user.repository';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@TaonRepository({
  className: 'TaonSessionUserIdentityRepository',
})
export class TaonSessionUserIdentityRepository extends TaonBaseRepository<TaonSessionUserIdentityEntity> {
  entityClassResolveFn: () => typeof TaonSessionUserIdentityEntity = () =>
    TaonSessionUserIdentityEntity;

  private readonly userRepository = this.injectCustomRepo(TaonSessionUserRepository);

  private readonly sessionProvider = this.injectProvider(TaonSessionProvider);

  normalizeEmail(email: string): string {
    //#region @websqlFunc
    if (typeof email !== 'string' || !email.trim() || email.trim().length > 500) {
      Taon.error({
        status: getStatusCode(HttpStatusEnum.BAD_REQUEST),
        message: t.gettext('A valid email address is required.'),
      });
    }
    return email.trim().toLowerCase();
    //#endregion
  }

  async findUserIdByEmail(
    email: string,
    manager: EntityManager = this.connection.manager,
  ): Promise<number | undefined> {
    //#region @websqlFunc
    const normalizedEmail = this.normalizeEmail(email);
    const identities = await manager.getRepository<TaonSessionUserIdentityEntity>(this.target).find({
      select: { userId: true },
      where: [
        { provider: TaonSessionIdentityProvider.PASSWORD, providerUserId: normalizedEmail },
        { email: normalizedEmail, isEmailVerified: true },
      ],
    });
    const userIds = [...new Set(identities.map(identity => identity.userId))];
    if (userIds.length > 1) {
      Taon.error({
        status: getStatusCode(HttpStatusEnum.CONFLICT),
        message: t.gettext('This email belongs to multiple accounts. Contact an administrator.'),
      });
    }
    return userIds[0];
    //#endregion
  }

  async resolveSocialIdentity(
    provider: TaonSessionIdentityProvider,
    providerUserId: string,
    email: string,
    isEmailVerified: boolean,
  ): Promise<TaonSessionUserIdentityEntity> {
    //#region @websqlFunc
    return this.connection.transaction('SERIALIZABLE', async manager => {
      const identities = manager.getRepository<TaonSessionUserIdentityEntity>(this.target);
      const existing = await identities.findOne({ where: { provider, providerUserId } });
      if (existing) {
        return existing;
      }
      const userId = this.sessionProvider.linkSocialAccountEmail === true && isEmailVerified === true
        ? await this.findUserIdByEmail(email, manager)
        : undefined;
      const users = manager.getRepository<TaonSessionUserEntity>(this.userRepository.target);
      const user = userId === undefined
        ? await users.save(new TaonSessionUserEntity())
        : await users.findOne({ where: { id: userId } });
      if (!user?.isActive) {
        Taon.error({
          context: 'resolveSocialIdentity',
          status: getStatusCode(HttpStatusEnum.INVALID_CREDENTIALS),
          message: t.gettext('User is not active'),
        });
      }
      return this.createSocialIdentity(
        user.id, provider, providerUserId, email, isEmailVerified, manager,
      );
    });
    //#endregion
  }

  async registerPasswordUser(email: string, password: string): Promise<TaonSessionUserEntity | null> {
    //#region @websqlFunc
    const normalizedEmail = this.normalizeEmail(email);
    if (typeof password !== 'string' || !password) {
      Taon.error({
        context: 'registerPasswordUser',
        status: getStatusCode(HttpStatusEnum.BAD_REQUEST),
        message: t.gettext('Password is required.'),
      });
    }
    const passwordHash = await UtilsPasswords.hashPassword(password);
    return this.connection.transaction('SERIALIZABLE', async manager => {
      const identities = manager.getRepository<TaonSessionUserIdentityEntity>(this.target);
      const existing = await identities.findOne({
        select: { id: true },
        where: { provider: TaonSessionIdentityProvider.PASSWORD, providerUserId: normalizedEmail },
      });
      if (existing) {
        return null;
      }
      if (this.sessionProvider.linkSocialAccountEmail === true &&
        await this.findUserIdByEmail(email, manager) !== undefined) {
        Taon.error({
          context: 'registerPasswordUser',
          status: getStatusCode(HttpStatusEnum.CONFLICT),
          message: t.gettext('Sign in with your existing provider, then connect email/password in your profile.'),
        });
      }
      const user = await manager.getRepository<TaonSessionUserEntity>(this.userRepository.target)
        .save(new TaonSessionUserEntity());
      await identities.save(this.passwordIdentity(user.id, normalizedEmail, passwordHash, false));
      return user;
    });
    //#endregion
  }

  async connectPasswordIdentity(
    userId: number,
    email: string,
    password: string,
  ): Promise<void> {
    //#region @websqlFunc
    const normalizedEmail = this.normalizeEmail(email);
    const passwordHash = await UtilsPasswords.hashPassword(password);
    await this.connection.transaction('SERIALIZABLE', async manager => {
      const identities = manager.getRepository<TaonSessionUserIdentityEntity>(this.target);
      const verifiedIdentity = await identities.findOne({
        select: { id: true },
        where: { userId, email: normalizedEmail, isEmailVerified: true },
      });
      if (!verifiedIdentity) {
        Taon.error({
          context: 'connectPasswordIdentity',
          status: getStatusCode(HttpStatusEnum.BAD_REQUEST),
          message: t.gettext('Use a verified email from a connected sign-in method.'),
        });
      }
      const emailUserId = await this.findUserIdByEmail(email, manager);
      const passwordIdentity = await identities.findOne({
        select: { id: true },
        where: { userId, provider: TaonSessionIdentityProvider.PASSWORD },
      });
      if (passwordIdentity || emailUserId !== userId) {
        Taon.error({
          context: 'connectPasswordIdentity',
          status: getStatusCode(HttpStatusEnum.CONFLICT),
          message: t.gettext('Email/password is already connected or this email belongs to another account.'),
        });
      }
      await identities.save(this.passwordIdentity(userId, normalizedEmail, passwordHash, true));
    });
    //#endregion
  }

  async createPasswordIdentity(
    userId: number,
    email: string,
    password: string,
  ): Promise<TaonSessionUserIdentityEntity> {
    //#region @websqlFunc

    const normalizedEmail = this.normalizeEmail(email);

    const identity = this.passwordIdentity(
      userId, normalizedEmail, await UtilsPasswords.hashPassword(password), false,
    );

    return await this.save(identity);

    //#endregion
  }

  private passwordIdentity(
    userId: number,
    normalizedEmail: string,
    passwordHash: string,
    isEmailVerified: boolean,
  ): TaonSessionUserIdentityEntity {
    //#region @websqlFunc
    return new TaonSessionUserIdentityEntity().clone({
      userId,
      provider: TaonSessionIdentityProvider.PASSWORD,
      providerUserId: normalizedEmail,
      email: normalizedEmail,
      passwordHash,
      isEmailVerified,
    });
    //#endregion
  }

  async findPasswordIdentity(
    email: string,
  ): Promise<TaonSessionUserIdentityEntity | null> {
    //#region @websqlFunc

    return await this.findOne({
      where: {
        provider: TaonSessionIdentityProvider.PASSWORD,
        providerUserId: this.normalizeEmail(email),
      },
    });

    //#endregion
  }

  async verifyPassword(
    email: string,
    password: string,
  ): Promise<TaonSessionUserIdentityEntity | null> {
    //#region @websqlFunc

    const identity = await this.findPasswordIdentity(email);

    if (!identity?.passwordHash) {
      return null;
    }

    const valid = await UtilsPasswords.verifyPassword(
      password,
      identity.passwordHash,
    );

    return valid ? identity : null;

    //#endregion
  }

  async findSocialIdentity(
    provider: TaonSessionIdentityProvider,
    providerUserId: string,
  ): Promise<TaonSessionUserIdentityEntity | null> {
    //#region @websqlFunc

    return await this.findOne({
      where: {
        provider,
        providerUserId,
      },
    });

    //#endregion
  }

  async createSocialIdentity(
    userId: number,
    provider: TaonSessionIdentityProvider,
    providerUserId: string,
    email?: string,
    isEmailVerified = false,
    manager: EntityManager = this.connection.manager,
  ): Promise<TaonSessionUserIdentityEntity> {
    //#region @websqlFunc

    const identity = new TaonSessionUserIdentityEntity().clone({
      userId,
      provider,
      providerUserId,
      email: email ? this.normalizeEmail(email) : undefined,
      isEmailVerified: isEmailVerified === true,
    });

    return await manager.getRepository<TaonSessionUserIdentityEntity>(this.target).save(identity);

    //#endregion
  }
}
