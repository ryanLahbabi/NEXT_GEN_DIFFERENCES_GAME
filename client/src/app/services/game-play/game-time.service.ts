import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { FromServer } from '@common/socket-event-constants';

@Injectable({
    providedIn: 'root',
})
export class GameTimeService {
    isReplayMode: boolean;
    recordedTimes: number[];
    recordedTimeIndex: number;
    firstTimeRecorded: boolean = false;

    private displayedTime: number;
    private preciseTime: number;

    constructor(private socketService: SocketClientService) {}

    get time(): number {
        return this.displayedTime;
    }

    get replayTime(): number {
        return this.preciseTime;
    }

    set time(newTime: number) {
        this.displayedTime = Math.floor(newTime);
        this.preciseTime = newTime;
        if (!this.firstTimeRecorded && !this.isReplayMode) {
            this.firstTimeRecorded = true;
        }
    }

    getInitialTime(): number {
        if (this.recordedTimes.length === 0) {
            return 0;
        }

        let maxTime = this.recordedTimes[0];
        for (let i = 1; i < this.recordedTimes.length; i++) {
            if (this.recordedTimes[i] > maxTime) {
                maxTime = this.recordedTimes[i];
            }
        }

        return maxTime;
    }

    init() {
        this.socketService.on(FromServer.TIME, this.processTimeEvent.bind(this));
    }

    nextRecordedTime() {
        if (!this.recordedTimes || this.recordedTimes.length === 0) {
            return;
        }
        this.time = this.recordedTimes[this.recordedTimeIndex];
        this.recordedTimeIndex++;
    }

    private processTimeEvent(data: number): void {
        if (!this.isReplayMode) {
            this.time = data;
            if (!this.firstTimeRecorded) {
                this.firstTimeRecorded = true;
            }
            this.recordedTimes.push(data);
        }
    }
}
