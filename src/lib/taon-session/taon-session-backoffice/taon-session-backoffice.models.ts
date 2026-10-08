import type { TaonSessionUserIdentityEntity } from '../../taon-session-user/taon-session-user-identity.entity';
import type { TaonSessionUserEntity } from '../../taon-session-user/taon-session-user.entity';
import type { TaonSessionEntity } from '../taon-session.entity';

export namespace TaonSessionBackofficeModels {
  export type SessionRow = Pick<
    TaonSessionEntity,
    'id' | 'userId' | 'deviceName' | 'ip'
  >;

  export type SessionDetails = SessionRow &
    Pick<
      TaonSessionEntity,
      | 'identityId'
      | 'authenticationProvider'
      | 'userAgent'
      | 'createdAt'
      | 'lastActivityAt'
      | 'expiresAt'
      | 'revokedAt'
      | 'revokeReason'
    > & {
      user: Pick<TaonSessionUserEntity, 'id' | 'username'> | null;
      identity: Pick<
        TaonSessionUserIdentityEntity,
        'id' | 'email' | 'provider'
      > | null;
    };
}