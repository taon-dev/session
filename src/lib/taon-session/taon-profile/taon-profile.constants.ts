import type { TaonProfileEntity } from './taon-profile.entity';
import { Translation } from '@taon-dev/i18n/src';
import { Taon } from 'taon/src';

const t = Translation.for(Taon.__FILE_RELATIVE_PATH, Taon.LANG_IMPORT_MAP);

export const TaonProfileDefaultsValues = {
  description: '',
  version: 0,
  id: void 0,
} as Partial<TaonProfileEntity>;

export enum TaonProfileErrors {
  INVALID_PASSWORD_EXAMPLE_ERROR = 'INVALID_PASSWORD_EXAMPLE_ERROR',
}

export const TaonProfileTranslationErorsMap = new Map([
  [TaonProfileErrors.INVALID_PASSWORD_EXAMPLE_ERROR, t.gettext('Invalid Password')],
]);