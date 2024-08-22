import { Language } from '../../enums/user/language.enum';
import { Theme } from '../../enums/user/theme.enum';

export interface InterfacePreferencesDTO {
    language: Language;
    theme: Theme;
}
