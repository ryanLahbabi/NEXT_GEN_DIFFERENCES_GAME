import { Component, OnInit } from '@angular/core';
import { DEFAULT_LANG } from '@app/constants/settings-constants';
import { SettingsService } from '@app/services/divers/settings.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    constructor(private translate: TranslateService, private settingsService: SettingsService) {}

    ngOnInit(): void {
        this.translate.setDefaultLang(DEFAULT_LANG);
        this.settingsService.language = DEFAULT_LANG;
    }
}
