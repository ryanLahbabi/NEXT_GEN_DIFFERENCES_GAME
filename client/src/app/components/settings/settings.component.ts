import { Component, DoCheck, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FAILURE_SOUNDS, SUCCESS_SOUNDS } from '@app/constants/settings-constants';
import { AccountService } from '@app/services/account/account.service';
import { HttpService } from '@app/services/communication/http.service';
import { SettingsService } from '@app/services/divers/settings.service';
import { Language } from '@common/enums/user/language.enum';
import { Theme } from '@common/enums/user/theme.enum';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, DoCheck {
    isEnglish: boolean;
    isLight: boolean;
    previousTheme: Theme;
    rootStyle = document.documentElement.style;

    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<SettingsComponent>,
        private readonly settingsService: SettingsService,
        private accountService: AccountService,
        private readonly httpService: HttpService,
    ) {}

    get themes() {
        return Theme;
    }

    get languages() {
        return Language;
    }

    get selectedSuccess(): string | undefined {
        return this.settingsService.successSound;
    }

    get selectedFailure(): string | undefined {
        return this.settingsService.failureSound;
    }

    get successSounds() {
        return SUCCESS_SOUNDS;
    }

    get failureSounds() {
        return FAILURE_SOUNDS;
    }

    get isLightTheme() {
        return this.settingsService.theme === Theme.Light;
    }

    ngOnInit(): void {
        this.isEnglish = this.settingsService.language === Language.English;
        this.isLight = this.settingsService.theme === Theme.Light;
    }

    ngDoCheck(): void {
        if (this.previousTheme !== this.settingsService.theme) {
            this.updateTheme();
            this.previousTheme = this.settingsService.theme;
        }
    }

    closeComponent() {
        this.dialogRef.close();
    }

    setLanguage(language: Language) {
        this.isEnglish = language === Language.English;
        this.httpService.putLanguage(language);
        this.settingsService.language = language;
        if (this.accountService.currentUser) {
            this.accountService.currentUser.interfacePreference.language = language;
            this.accountService.saveUserData();
        }
    }

    setTheme(theme: Theme) {
        this.isLight = theme === Theme.Light;
        this.httpService.putTheme(theme);
        this.settingsService.theme = theme;
        if (this.accountService.currentUser) {
            this.accountService.currentUser.interfacePreference.theme = theme;
            this.accountService.saveUserData();
        }
    }

    playSound(sound: string, type: string) {
        if (type === 'success') {
            this.httpService.putSuccess(sound);
            this.settingsService.successSound = sound;
            if (this.accountService.currentUser) {
                this.accountService.currentUser.success = sound;
                this.accountService.saveUserData();
            }
        } else {
            this.httpService.putFailure(sound);
            this.settingsService.failureSound = sound;
            if (this.accountService.currentUser) {
                this.accountService.currentUser.failure = sound;
                this.accountService.saveUserData();
            }
        }
        const audio = new Audio(sound);
        audio.volume = 0.2;
        audio.play();
    }

    updateTheme() {
        if (this.isLightTheme) {
            return this.rootStyle.setProperty('--host-bg-color', 'burlywood');
        } else {
            return this.rootStyle.setProperty('--host-bg-color', 'grey');
        }
    }
}
