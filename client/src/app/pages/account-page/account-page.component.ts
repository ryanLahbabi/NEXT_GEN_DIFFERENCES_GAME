import { Component } from '@angular/core';
import { AccountService } from '@app/services/account/account.service';

@Component({
    selector: 'app-account-page',
    templateUrl: './account-page.component.html',
    styleUrls: ['./account-page.component.scss'],
})
export class AccountPageComponent {
    constructor(readonly accountService: AccountService) {}

    logOut(): void {
        this.accountService.logout();
    }

    round(nb?: number) {
        if (nb) {
            return nb.toFixed(2);
        } else {
            return 0;
        }
    }
}
