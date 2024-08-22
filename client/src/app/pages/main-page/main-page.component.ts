import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
// eslint-disable-next-line max-len
import { AdminModalComponent } from '@app/components/config-selection/admin-modal/admin-modal.component';
import { AcceptFriendsComponent } from '@app/components/general/accept-friends/accept-friends.component';
import { FriendsComponent } from '@app/components/general/friends/friends.component';
import { SettingsComponent } from '@app/components/settings/settings.component';
import { DIALOG_CUSTOM_CONFIG } from '@app/constants/dialog-config';
import { AccountService } from '@app/services/account/account.service';
import { SettingsService } from '@app/services/divers/settings.service';
import { FriendsService } from '@app/services/friends/friends.service';
import { Theme } from '@common/enums/user/theme.enum';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    // eslint-disable-next-line max-params
    constructor(
        public accountService: AccountService,
        public friendService: FriendsService,
        private dialog: MatDialog,
        private readonly settingsService: SettingsService,
    ) {}

    get isLightTheme() {
        return this.settingsService.theme === Theme.Light;
    }

    openSettings() {
        const dialogConfig = Object.assign({}, DIALOG_CUSTOM_CONFIG);
        this.dialog.open(SettingsComponent, dialogConfig);
    }

    requestAdminPage(): void {
        const dialogAdmin = Object.assign({}, DIALOG_CUSTOM_CONFIG);
        this.dialog.open(AdminModalComponent, dialogAdmin);
    }

    requestFriendsAdding(): void {
        this.friendService.init();
        this.dialog.open(FriendsComponent, DIALOG_CUSTOM_CONFIG);
    }

    requestFriendsDemands(): void {
        this.dialog.open(AcceptFriendsComponent, DIALOG_CUSTOM_CONFIG);
    }
}
