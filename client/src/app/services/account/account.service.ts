/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { OverseerService } from '@app/services/divers/overseer.service';
import { SettingsService } from '@app/services/divers/settings.service';
import ErrorDTO from '@common/dto/error.dto';
import { PrivateUserDataDTO } from '@common/dto/user/private-user-data.dto';
import { Language } from '@common/enums/user/language.enum';
import { FromServer } from '@common/socket-event-constants';

@Injectable({
    providedIn: 'root',
})
export class AccountService {
    currentUser?: PrivateUserDataDTO;
    private tabKeepAlive = false;
    private newSession: boolean = false;
    private accountToken?: string;

    // eslint-disable-next-line max-params
    constructor(
        private readonly socketService: SocketClientService,
        private readonly router: Router,
        private readonly overseerService: OverseerService,
        private readonly settingsService: SettingsService,
    ) {
        const TAB_KEEPALIVE_MS = 400;
        const keepAliveInfo = JSON.parse(localStorage.getItem('tabKeepAlive') || '{}');
        if (Object.keys(keepAliveInfo).length === 3 && keepAliveInfo.time >= Date.now() - TAB_KEEPALIVE_MS) {
            this.currentUser = keepAliveInfo.userData;
            this.accountToken = keepAliveInfo.token;
            this.tabKeepAlive = false;
        } else this.accountToken = this.storedtoken;
        localStorage.removeItem('tabKeepAlive');
        if (this.isLoggedIn) this.startApp(this.router.url.includes('/login') ? '/home' : undefined);
    }

    get token(): string | undefined {
        return this.accountToken;
    }

    /** @returns True if the active account has it's data stored on the device.*/
    get isMainAccount(): boolean {
        return this.isLoggedIn && this.accountToken === this.storedtoken;
    }

    get storedtoken(): string | undefined {
        const storedToken = localStorage.getItem('token');
        return storedToken !== null && storedToken !== '' ? storedToken : undefined;
    }

    get isLoggedIn(): boolean {
        return this.accountToken !== undefined;
    }

    get userLanguage(): Language {
        return this.settingsService.language;
    }

    keepAlive(accountService: AccountService): () => void {
        return () => {
            const isMainAccount = accountService.accountToken !== '' && accountService.accountToken === localStorage.getItem('token');
            if (!isMainAccount)
                localStorage.setItem(
                    'tabKeepAlive',
                    JSON.stringify({ token: accountService.accountToken, userData: accountService.currentUser, time: Date.now() }),
                );
        };
    }

    toMainAccount(): boolean {
        if (this.isLoggedIn) localStorage.setItem('token', this.accountToken!);
        return this.isLoggedIn;
    }

    updateToken(token: string) {
        if (this.isMainAccount) {
            this.accountToken = token;
            localStorage.setItem('token', token);
        } else {
            this.accountToken = token;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.socketService.removeListener({ name: 'disconnect' } as any);
        this.socketService.disconnect();
        this.tabKeepAlive = true;
        this.startApp();
    }

    logout(): void {
        this.deleteUserData();
        window.onbeforeunload = () => undefined;
        this.socketService.disconnect();
        this.router.navigateByUrl('/login');
    }

    login(token: string): void {
        this.accountToken = token;
        this.toMainAccount();
        this.newSession = true;
        this.startApp('/home');
    }

    startApp(goOnConnect?: string): void {
        let serviceStart = false;
        this.socketService.connect(this);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.socketService.on({ name: 'connect' } as any, () => {
            if (!serviceStart && (this.tabKeepAlive || this.fetchUserData())) {
                this.overseerService.init(this.currentUser!, () => this.accountToken!);
                serviceStart = true;
            }
        });
        this.socketService.on(FromServer.SOCKET_ERRORS, (error: ErrorDTO) => {
            switch (error.name) {
                case 'INVALID_TOKEN':
                case 'USER_NOT_FOUND':
                    this.logout();
                    break;
            }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.socketService.on({ name: 'disconnect' } as any, () => {
            this.accountToken = undefined;
            this.router.navigateByUrl('/login');
        });
        this.socketService.on(FromServer.START_APP, (userData: PrivateUserDataDTO) => {
            if (this.currentUser !== undefined) {
                Object.keys(userData).forEach((k) => {
                    (this.currentUser as any)[k] = (userData as any)[k];
                });
            } else {
                this.currentUser = userData;
            }
            if (!serviceStart) {
                this.overseerService.init(userData, () => this.accountToken!);
                serviceStart = true;
            }
            // this.loggedInEvent.emit(); // what does it do????
            this.saveUserData();
            window.onbeforeunload = this.keepAlive(this);
            if (goOnConnect) this.router.navigateByUrl(goOnConnect);
        });
    }

    saveUserData(): boolean {
        if (this.isMainAccount) localStorage.setItem('userData', JSON.stringify(this.currentUser));
        return this.isMainAccount;
    }

    fetchUserData(): boolean {
        if (this.isMainAccount && !this.newSession) {
            const stringUserData = localStorage.getItem('userData');
            if (stringUserData) {
                this.currentUser = JSON.parse(stringUserData);
                return true;
            }
        }
        return false;
    }

    deleteUserData() {
        if (this.isMainAccount) {
            localStorage.removeItem('userData');
            localStorage.removeItem('token');
        }
        this.currentUser = undefined;
    }

    // private handleError(error: HttpErrorResponse) {
    //     if (error.status === HttpStatusCode.Unauthorized && this.isLoggedIn) {
    //         alert('Vous avez été déconnecté.');
    //         this.logout();
    //     }
    //     return throwError(() => new Error(error.error.message));
    // }
}
