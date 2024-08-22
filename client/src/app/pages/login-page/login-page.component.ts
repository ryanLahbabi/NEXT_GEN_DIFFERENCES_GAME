/* eslint-disable import/namespace */
/* eslint-disable import/no-deprecated */
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ERROR_VISIBILITY_TIME } from '@app/constants/account-constants';
import { AccountService } from '@app/services/account/account.service';
import { HttpService } from '@app/services/communication/http.service';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { PrivateUserDataDTO } from '@common/dto/user/private-user-data.dto';
import { FromServer } from '@common/socket-event-constants';
import { catchError, throwError } from 'rxjs';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
    username: string;
    password: string;
    errorMessage: string;
    private lastErrorTime: number;

    // eslint-disable-next-line max-params
    constructor(
        private socketService: SocketClientService,
        private readonly accountService: AccountService,
        private readonly httpService: HttpService,
        private readonly router: Router,
    ) {}

    ngOnInit(): void {
        if (this.accountService.isLoggedIn) {
            this.socketService.on(FromServer.START_APP, (successful: PrivateUserDataDTO) => {
                if (successful.success) this.router.navigateByUrl('/home');
            });
        }
    }

    async onSubmit(): Promise<void> {
        this.httpService
            .postLogin(this.username, this.password)
            .pipe(catchError(this.handleError.bind(this)))
            .subscribe((response) => {
                this.accountService.login(response.accessToken);
            });
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error.name === 'UnauthorizedException' || error.error.name === 'USER_NOT_FOUND') {
            this.showError('ERROR_WRONG_PWD_OR_USERNAME');
        } else if (error.error.name === 'USER_ALREADY_CONNECTED') {
            this.showError('ERROR_ALREADY_LOGGED_IN');
        } else {
            this.showError('ERROR_GENERAL');
        }
        return throwError(() => new Error(error.error.message));
    }

    private async showError(message: string): Promise<void> {
        this.errorMessage = message;
        const startingTime = Date.now();
        this.lastErrorTime = startingTime;
        await new Promise((resolve) => {
            setTimeout(resolve, ERROR_VISIBILITY_TIME);
        });
        if (startingTime === this.lastErrorTime) {
            this.errorMessage = '';
        }
    }
}
