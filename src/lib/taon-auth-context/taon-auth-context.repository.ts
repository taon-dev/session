//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonGroupRepository } from '../taon-group/taon-group.repository';
import { TaonPermissionRepository } from '../taon-permission/taon-permission.repository';
import { TaonRoleRepository } from '../taon-role/taon-role.repository';
import { TaonSessionRepository } from '../taon-session/taon-session.repository';
import { TaonSessionUserRepository } from '../taon-session-user/taon-session-user.repository';

import { TaonAuthContextEntity } from './taon-auth-context.entity';
//#endregion

@TaonRepository({
  className: 'TaonAuthContextRepository',
})
export class TaonAuthContextRepository extends TaonBaseRepository<TaonAuthContextEntity> {
  //#region  fields & getters
  entityClassResolveFn: () => typeof TaonAuthContextEntity = () =>
    TaonAuthContextEntity;

  private readonly taonSessionUserRepository = this.injectCustomRepo(
    TaonSessionUserRepository,
  );

  private readonly taonSessionRepository = this.injectCustomRepo(
    TaonSessionRepository,
  );

  private readonly taonGroupRepository =
    this.injectCustomRepo(TaonGroupRepository);

  private readonly taonPermissionRepository = this.injectCustomRepo(
    TaonPermissionRepository,
  );

  private readonly taonRoleRepository =
    this.injectCustomRepo(TaonRoleRepository);
  //#endregion

  //#region get context
  public async getContext(
    userId: number | string,
  ): Promise<TaonAuthContextEntity> {
    //#region @websqlFunc
    const context = new TaonAuthContextEntity();
    context.user = await this.taonSessionUserRepository.getUserById(userId);
    context.session = await this.taonSessionRepository.getSessionBy(userId);
    context.groups = (
      await this.taonGroupRepository.getGroupsForUserId(userId)
    ).map(c => c.code);

    context.roles = (
      await this.taonRoleRepository.getRolesForUserId(userId)
    ).map(c => c.code);

    context.permissions = (
      await this.taonPermissionRepository.getPermissionsForUserId(userId)
    ).map(c => c.code);

    return context;
    //#endregion
  }
  //#endregion
}
