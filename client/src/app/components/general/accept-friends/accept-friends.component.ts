import { Component, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AccountService } from '@app/services/account/account.service';
import { SettingsService } from '@app/services/divers/settings.service';
import { FriendsService } from '@app/services/friends/friends.service';
import { Language } from '@common/enums/user/language.enum';
import { Theme } from '@common/enums/user/theme.enum';

@Component({
    selector: 'app-accept-friends',
    templateUrl: './accept-friends.component.html',
    styleUrls: ['./accept-friends.component.scss'],
})
export class AcceptFriendsComponent implements OnInit {
    pendingRequestPath: string;
    rootStyle = document.documentElement.style;

    // eslint-disable-next-line max-params
    constructor(
        @Optional() public dialogRef: MatDialogRef<AcceptFriendsComponent>,
        public friendService: FriendsService,
        public accountService: AccountService,
        private readonly settingsService: SettingsService,
    ) {}

    get isLightTheme() {
        return this.settingsService.theme === Theme.Light;
    }

    setBackgroundColor() {
        if (this.isLightTheme) {
            return this.rootStyle.setProperty('--host-bg-color', 'burlywood');
        } else {
            return this.rootStyle.setProperty('--host-bg-color', 'grey');
        }
    }

    ngOnInit(): void {
        this.updatePendingRequestsPath();
        this.friendService.init();
        this.setBackgroundColor();
    }

    closeDialog() {
        this.dialogRef.close();
    }

    updatePendingRequestsPath(): void {
        if (this.accountService.userLanguage === Language.English) {
            this.pendingRequestPath = './assets/no-pending-request-en.png';
        } else {
            this.pendingRequestPath = './assets/no-pending-request.png';
        }
    }
}
