/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PrivateUserDataDTO } from '@common/dto/user/private-user-data.dto';
import { LikeOperation } from '@common/enums/like-operation.enum';
import { Language } from '@common/enums/user/language.enum';
import { Theme } from '@common/enums/user/theme.enum';
import { Replay, ReplayListInfo } from '@common/interfaces/game-play/replay-action';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    private getToken: () => string;

    constructor(private readonly httpClient: HttpClient) {}

    init(getToken: () => string) {
        this.getToken = getToken;
    }

    postReplay(replay: Replay): void {
        this.httpClient
            .post<void>(
                `${environment.serverUrl}/replays`,
                { replay },
                {
                    headers: { Authorization: 'Bearer ' + this.getToken() },
                },
            )
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .subscribe({ complete: () => {} });
    }

    getReplayInfoForCurrentUser(): Observable<ReplayListInfo[]> {
        return this.httpClient.get<ReplayListInfo[]>(`${environment.serverUrl}/replays/info`, {
            headers: { Authorization: 'Bearer ' + this.getToken() },
        });
    }

    getReplayDatesForCurrentUser(): Observable<string[]> {
        return this.httpClient.get<string[]>(`${environment.serverUrl}/replays/dates`, {
            headers: { Authorization: 'Bearer ' + this.getToken() },
        });
    }

    getReplayByDatesForCurrentUser(createdAt: string): Observable<Replay> {
        return this.httpClient.get<Replay>(`${environment.serverUrl}/replays/${createdAt}`, {
            headers: { Authorization: 'Bearer ' + this.getToken() },
        });
    }

    async deleteReplayByDateForCurrentUser(createdAt: string): Promise<void> {
        return this.toPromise(
            this.httpClient.post<void>(
                `${environment.serverUrl}/replays/delete/${createdAt}`,
                {},
                {
                    headers: { Authorization: 'Bearer ' + this.getToken() },
                },
            ),
        );
    }

    postLogin(username: string, hashedPassword: string): Observable<{ accessToken: string }> {
        return this.httpClient.post<{ accessToken: string }>(`${environment.serverUrl}/auth/login`, {
            username,
            hashedPassword,
        });
    }

    postSignup(username: string, email: string, hashedPassword: string, avatar: string): Observable<{ accessToken: string }> {
        return this.httpClient.post<{ accessToken: string }>(`${environment.serverUrl}/auth/signup`, {
            username,
            email,
            hashedPassword,
            avatar,
        });
    }

    getUserMe(): Observable<PrivateUserDataDTO> {
        return this.httpClient.get<PrivateUserDataDTO>(`${environment.serverUrl}/user/me`, {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            headers: { Authorization: 'Bearer ' + this.getToken() },
        });
    }

    postAdmin(password: string): Observable<void> {
        return this.httpClient.post<void>(
            `${environment.serverUrl}/auth/adminLogin`,
            { password },
            {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                headers: { Authorization: 'Bearer ' + this.getToken() },
            },
        );
    }

    async putBiography(biography: string): Promise<void> {
        return this.toPromise(
            this.httpClient.put<void>(
                `${environment.serverUrl}/user/biography`,
                { biography },
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    headers: { Authorization: 'Bearer ' + this.getToken() },
                },
            ),
        );
    }

    async likeFunction(cardId: string, likeOp: LikeOperation): Promise<{ cardLikes: number }> {
        return this.toPromise(
            this.httpClient.post<{ cardLikes: number }>(
                `${environment.serverUrl}/card/like`,
                { cardId, likeOp },
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    headers: { Authorization: 'Bearer ' + this.getToken() },
                },
            ),
        );
    }

    async putAvatar(avatar: string): Promise<PrivateUserDataDTO> {
        return this.toPromise(
            this.httpClient.put<PrivateUserDataDTO>(
                `${environment.serverUrl}/user/avatar`,
                { avatar },
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    headers: { Authorization: 'Bearer ' + this.getToken() },
                },
            ),
        );
    }

    putUsername(username: string, onSuccess: (newUsername: string, newToken: string) => void, onFailure: (error: string) => void) {
        this.httpClient
            .post<void>(
                `${environment.serverUrl}/user/username`,
                { newUsername: username },
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    headers: { Authorization: 'Bearer ' + this.getToken() },
                },
            )
            .pipe(
                catchError((error: HttpErrorResponse) => {
                    onFailure(error.error.name);
                    return throwError(() => new Error(error.error.message));
                }),
            )
            .subscribe((data: any) => onSuccess(data.username, data.token));
    }

    putLanguage(language: Language, onSuccess?: () => void) {
        this.httpClient
            .put<void>(
                `${environment.serverUrl}/user/language`,
                { language },
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    headers: { Authorization: 'Bearer ' + this.getToken() },
                },
            )
            .subscribe({ complete: onSuccess });
    }

    putTheme(theme: Theme) {
        this.httpClient
            .put<PrivateUserDataDTO>(
                `${environment.serverUrl}/user/theme`,
                { theme },
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    headers: { Authorization: 'Bearer ' + this.getToken() },
                },
            )
            .subscribe();
    }

    async createChannel(name: string): Promise<any> {
        return this.toPromise(
            this.httpClient.post<any>(
                `${environment.serverUrl}/chan/create`,
                { name }, // Adjusted to send username and channelId directly
                {
                    headers: { Authorization: 'Bearer ' + this.getToken() },
                },
            ),
        );
    }

    deleteChannel(channelId: string, username: string) {
        this.httpClient
            .delete(`${environment.serverUrl}/chan`, {
                body: { channelId, username },
                headers: { Authorization: 'Bearer ' + this.getToken() },
            })
            // eslint-disable-next-line deprecation/deprecation
            .subscribe(
                () => {
                    // Add any additional logic here after successful deletion
                },
                () => {
                    // Handle error appropriately, e.g., display an error message to the user
                },
            );
    }

    // eslint-disable-next-line max-params
    async joinChannel(channelId: string): Promise<void> {
        return this.toPromise(
            this.httpClient.post<void>(
                `${environment.serverUrl}/chan/join`,
                { channelId }, // Adjusted to send username and channelId directly
                {
                    headers: { Authorization: 'Bearer ' + this.getToken() },
                },
            ),
        );
    }

    // eslint-disable-next-line max-params
    async leaveChannel(channelId: string): Promise<void> {
        return this.toPromise(
            this.httpClient.post<void>(
                `${environment.serverUrl}/chan/leave`,
                { channelId },
                {
                    headers: { Authorization: 'Bearer ' + this.getToken() },
                },
            ),
        );
    }
    putSuccess(success: string) {
        this.httpClient
            .put<void>(
                `${environment.serverUrl}/user/success`,
                { success },
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    headers: { Authorization: 'Bearer ' + this.getToken() },
                },
            )
            .subscribe();
    }
    putFailure(failure: string) {
        this.httpClient
            .put<void>(
                `${environment.serverUrl}/user/failure`,
                { failure },
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    headers: { Authorization: 'Bearer ' + this.getToken() },
                },
            )
            .subscribe();
    }

    blockUser(username: string): Observable<unknown> {
        return this.httpClient.post<void>(
            `${environment.serverUrl}/user/block`,
            { username },
            {
                headers: { authorization: 'Bearer ' + this.getToken() },
            },
        );
    }

    unBlockUser(username: string): Observable<unknown> {
        return this.httpClient.post<void>(
            `${environment.serverUrl}/user/unblock`,
            { username },
            {
                headers: { authorization: 'Bearer ' + this.getToken() },
            },
        );
    }
    async sendEmail(email: string, verificationCode: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // eslint-disable-next-line deprecation/deprecation
            this.httpClient.post<unknown>(`${environment.serverUrl}/auth/send-verification-email`, { email, verificationCode }).subscribe(
                () => {
                    resolve();
                },
                (error) => {
                    reject(error);
                },
            );
        });
    }

    async sendComfirmation(email: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            // eslint-disable-next-line deprecation/deprecation
            this.httpClient.post<unknown>(`${environment.serverUrl}/auth/send-confirmation-email`, { email }).subscribe(
                () => {
                    resolve();
                },
                (error) => {
                    reject(error);
                },
            );
        });
    }

    updatePassword(email: string, password: string): Observable<void> {
        return this.httpClient.put<void>(`${environment.serverUrl}/auth/update-password`, { email, password });
    }

    async toPromise<T>(obs: Observable<T>): Promise<T> {
        let res;
        let rej;
        const promise = new Promise<T>((response, reject) => {
            res = response;
            rej = reject;
        });
        obs.subscribe({ next: res, error: rej });
        return promise;
    }
}
