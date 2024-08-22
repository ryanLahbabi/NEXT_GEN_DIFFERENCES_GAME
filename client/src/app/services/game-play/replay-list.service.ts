/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/communication/http.service';
import { Replay, ReplayListInfo } from '@common/interfaces/game-play/replay-action';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ReplayListService {
    dateList: string[] = [];
    replayList: ReplayListInfo[];

    constructor(private httpService: HttpService) {}

    init(): void {
        // this.getReplayDatesForCurrentUser().subscribe({
        //     next: (dates) => (this.dateList = dates),
        //     error: (error) => console.error('Error fetching replay dates', error),
        // });
        this.getReplayInfoByCurrentUser().subscribe({
            next: (replays) => (this.replayList = replays),
            error: (error) => console.error('Error fetching replay information', error),
        });
    }

    getReplayInfoByCurrentUser(): Observable<ReplayListInfo[]> {
        return this.httpService.getReplayInfoForCurrentUser();
    }

    getReplayDatesForCurrentUser(): Observable<string[]> {
        return this.httpService.getReplayDatesForCurrentUser();
    }

    getReplayByDatesForCurrentUser(createdAt: string): Observable<Replay> {
        return this.httpService.getReplayByDatesForCurrentUser(createdAt);
    }

    async deleteReplayByDateForCurrentUser(createdAt: string): Promise<void> {
        await this.httpService.deleteReplayByDateForCurrentUser(createdAt);
        this.dateList = this.dateList.filter((d) => d !== createdAt);
        this.replayList = this.replayList.filter((d) => d.createdAt !== createdAt);
    }
}
