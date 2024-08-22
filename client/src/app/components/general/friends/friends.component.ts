import { Component, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AccountService } from '@app/services/account/account.service';
import { SettingsService } from '@app/services/divers/settings.service';
import { FriendsService } from '@app/services/friends/friends.service';
import { Theme } from '@common/enums/user/theme.enum';

@Component({
    selector: 'app-friends',
    templateUrl: './friends.component.html',
    styleUrls: ['./friends.component.scss'],
})
export class FriendsComponent implements OnInit {
    rootStyle = document.documentElement.style;

    // eslint-disable-next-line max-params
    constructor(
        @Optional() public dialogRef: MatDialogRef<FriendsComponent>,
        public friendService: FriendsService,
        public accountService: AccountService,
        private readonly settingsService: SettingsService,
        private router: Router,
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
        this.friendService.isAFriend(this.accountService.currentUser?.username);
        this.friendService.isPending(this.accountService.currentUser?.username);
        this.friendService.init();
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        this.setBackgroundColor();
    }

    closeDialog() {
        this.friendService.searchTerm = '';
        this.dialogRef.close();
    }

    navigateToAccount(friendUsername: string) {
        this.closeDialog();
        this.router.navigate(['/users-profile'], { queryParams: { username: friendUsername } });
    }
}
