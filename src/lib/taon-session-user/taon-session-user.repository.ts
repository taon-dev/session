//#region imports
import { getStatusCode, HttpStatusEnum, Taon, TaonBaseRepository, TaonRepository } from 'taon/src';
import { QueryFailedError } from 'taon-typeorm/src';
import { Translation } from '@taon-dev/i18n/src';

import { TaonSessionUserEntity } from './taon-session-user.entity';
//#endregion

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

@TaonRepository({
  className: 'TaonSessionUserRepository',
})
export class TaonSessionUserRepository extends TaonBaseRepository<TaonSessionUserEntity> {
  entityClassResolveFn: () => typeof TaonSessionUserEntity = () =>
    TaonSessionUserEntity;

  async createUser(): Promise<TaonSessionUserEntity> {
    //#region @websqlFunc

    const user = new TaonSessionUserEntity();

    return await this.save(user);

    //#endregion
  }

  normalizeUsername(username: string): string {
    //#region @websqlFunc
    if (typeof username !== 'string' || !username.trim() || username.trim().length > 255) {
      Taon.error({
        context: 'normalizeUsername',
        status: getStatusCode(HttpStatusEnum.BAD_REQUEST),
        message: t.gettext('Username must contain between 1 and 255 characters.'),
      });
    }
    return username.trim();
    //#endregion
  }

  async isUsernameAvailable(username: string, userId: number): Promise<boolean> {
    //#region @websqlFunc
    const existing = await this.findOne({
      select: { id: true },
      where: { username: this.normalizeUsername(username) },
    });
    return !existing || existing.id === userId;
    //#endregion
  }

  async changeUsername(userId: number, username: string): Promise<void> {
    //#region @websqlFunc
    const normalizedUsername = this.normalizeUsername(username);
    if (!(await this.isUsernameAvailable(normalizedUsername, userId))) {
      Taon.error({
        context: 'changeUsername',
        status: getStatusCode(HttpStatusEnum.CONFLICT),
        message: t.gettext('This username is already taken.'),
      });
    }
    try {
      const result = await this.repo.update(userId, { username: normalizedUsername });
      if (!result.affected) {
        Taon.error({
          context: 'changeUsername',
          status: getStatusCode(HttpStatusEnum.NOT_FOUND),
          message: t.gettext('User not found.'),
        });
      }
    } catch (error) {
      if (error instanceof QueryFailedError &&
        !(await this.isUsernameAvailable(normalizedUsername, userId))) {
        Taon.error({
          context: 'changeUsername',
          status: getStatusCode(HttpStatusEnum.CONFLICT),
          message: t.gettext('This username is already taken.'),
        });
      }
      throw error;
    }
    //#endregion
  }

  async getUserById(
    userId: number | string,
  ): Promise<TaonSessionUserEntity | null> {
    //#region @websqlFunc

    const user = await this.findOne({
      where: {
        id: userId as any,
      },
      relations: {
        identities: true,
      },
    });

    for (const identity of user?.identities || []) {
      delete identity.passwordHash;
    }

    return user;
    //#endregion
  }
}
