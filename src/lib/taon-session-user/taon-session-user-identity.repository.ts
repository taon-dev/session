import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { UtilsPasswords } from 'tnp-helpers/src';

import { TaonSessionUserIdentityEntity } from './taon-session-user-identity.entity';
import { TaonSessionIdentityProvider } from './taon-session-user.models';

@TaonRepository({
  className: 'TaonSessionUserIdentityRepository',
})
export class TaonSessionUserIdentityRepository extends TaonBaseRepository<TaonSessionUserIdentityEntity> {
  entityClassResolveFn: () => typeof TaonSessionUserIdentityEntity = () =>
    TaonSessionUserIdentityEntity;

  normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async createPasswordIdentity(
    userId: number,
    email: string,
    password: string,
  ): Promise<TaonSessionUserIdentityEntity> {
    //#region @websqlFunc

    const normalizedEmail = this.normalizeEmail(email);

    const identity = new TaonSessionUserIdentityEntity().clone({
      userId,

      provider: TaonSessionIdentityProvider.PASSWORD,

      // for PASSWORD identity, email is our identity key
      providerUserId: normalizedEmail,

      email: normalizedEmail,

      passwordHash: await UtilsPasswords.hashPassword(password),

      isEmailVerified: false,
    });

    return await this.save(identity);

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
  ): Promise<TaonSessionUserIdentityEntity> {
    //#region @websqlFunc

    const identity = new TaonSessionUserIdentityEntity().clone({
      userId,
      provider,
      providerUserId,
      email: email?.trim().toLowerCase(),
      isEmailVerified,
    });

    return await this.save(identity);

    //#endregion
  }
}
