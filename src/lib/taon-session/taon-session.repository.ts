//#region imports
import { TaonBaseRepository, TaonRepository } from 'taon/src';
import { Raw } from 'taon-typeorm/src';

import { TaonSessionEntity } from './taon-session.entity';
//#endregion

@TaonRepository({
  className: 'TaonSessionRepository',
})
export class TaonSessionRepository extends TaonBaseRepository<TaonSessionEntity> {
  entityClassResolveFn: () => typeof TaonSessionEntity = () =>
    TaonSessionEntity;
}
