import { Injectable } from '@angular/core';
import { DEFAULT_FAILURE, DEFAULT_LANG, DEFAULT_SUCCESS, DEFAULT_THEME } from '@app/constants/settings-constants';
import { PrivateUserDataDTO } from '@common/dto/user/private-user-data.dto';
import { Language } from '@common/enums/user/language.enum';
import { Theme } from '@common/enums/user/theme.enum';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
    providedIn: 'root',
})
export class SettingsService {
    theme: Theme;
    successSound: string;
    failureSound: string;
    private lang: Language;

    constructor(private readonly translate: TranslateService) {}

    get language(): Language {
        return this.lang;
    }

    set language(language: Language) {
        this.lang = language;
        this.translate.use(language);
    }

    init(userData: PrivateUserDataDTO) {
        this.initLanguage(userData);
        this.initTheme(userData);
        this.initSounds(userData);
    }

    private initLanguage(userData: PrivateUserDataDTO) {
        if (userData.interfacePreference.language) {
            this.language = userData.interfacePreference.language;
        } else {
            this.language = DEFAULT_LANG;
        }
    }

    private initTheme(userData: PrivateUserDataDTO) {
        if (userData.interfacePreference.theme) {
            this.theme = userData.interfacePreference.theme;
        } else {
            this.theme = DEFAULT_THEME;
        }
    }

    private initSounds(userData: PrivateUserDataDTO) {
        this.successSound = userData.success ? userData.success : DEFAULT_SUCCESS;
        this.failureSound = userData.failure ? userData.failure : DEFAULT_FAILURE;
    }
}
