import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '@app/services/account/account.service';
import { FriendsService } from '@app/services/friends/friends.service';
import { PrivateUserDataDTO } from '@common/dto/user/private-user-data.dto';

@Component({
    selector: 'app-users-profile',
    templateUrl: './users-profile.component.html',
    styleUrls: ['./users-profile.component.scss'],
})
export class UsersProfileComponent implements OnInit {
    username: string;
    user: PrivateUserDataDTO;

    constructor(public friendService: FriendsService, readonly accountService: AccountService, private route: ActivatedRoute) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            this.username = params['username'];
        });
        this.user = this.friendService.getUserStats(this.username);
    }

    round(nb?: number) {
        if (nb) {
            return nb.toFixed(2);
        } else {
            return 0;
        }
    }
}
