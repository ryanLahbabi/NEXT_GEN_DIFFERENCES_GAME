import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { INVALID_INDEX } from '@app/constants/replay-constants';
import { PERCENTAGE } from '@app/constants/time-constants';
import { GameTimeService } from '@app/services/game-play/game-time.service';
import { ReplayService } from '@app/services/game-play/replay.service';
import { Speed } from '@common/enums/game-play/speed';

@Component({
    selector: 'app-replay-area',
    templateUrl: './replay-area.component.html',
    styleUrls: ['./replay-area.component.scss'],
})
export class ReplayAreaComponent {
    paused: boolean;
    speed: Speed;
    showSaveButton: boolean = true;
    private timeJumpQueue: number[] = [];

    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private replayService: ReplayService,
        private gameTimeService: GameTimeService,
        private activatedRoute: ActivatedRoute,
    ) {
        this.paused = false;
        this.speed = Speed.NORMAL;
        this.activatedRoute.queryParams.subscribe((params) => {
            this.showSaveButton = !(params['replay'] === 'true');
        });
    }

    get ended() {
        return !this.replayService.isReplaying;
    }

    get progress(): number {
        if (!this.gameTimeService.recordedTimes) {
            return 0;
        }
        return this.gameTimeService.recordedTimes.length > 0
            ? Math.floor((this.gameTimeService.recordedTimeIndex / this.gameTimeService.recordedTimes.length) * PERCENTAGE)
            : 0;
    }

    get speeds() {
        return Speed;
    }

    onProgressBarClick(event: Event): void {
        if (!this.paused) {
            this.pause();
        }
        const inputElement = event.target as HTMLInputElement;
        const percentage = parseInt(inputElement.value, 10) / PERCENTAGE;
        const clickedTime = this.replayService.getInitialTime() - percentage * this.replayService.getElapsedTime();
        this.timeJumpQueue.push(clickedTime);
        if (this.timeJumpQueue.length === 1) {
            this.processNextTimeJump();
        }
    }

    restoreGameStateToTime(clickedTime: number): void {
        this.replayService.pause();
        this.replayService.restoreGameStateFromTime(clickedTime);
    }

    resetGameTimeToNearestRecordedTime(time: number): void {
        this.gameTimeService.recordedTimeIndex = this.findNearestRecordedTimeComparedToInput(time);
    }

    findNearestRecordedTimeComparedToInput(time: number): number {
        let minDiff = Number.MAX_VALUE;
        let closestTime = INVALID_INDEX;
        for (let i = 0; i < this.gameTimeService.recordedTimes.length; i++) {
            const diff = Math.abs(this.gameTimeService.recordedTimes[i] - time);
            if (diff < minDiff) {
                minDiff = diff;
                closestTime = i;
            }
        }
        return closestTime;
    }

    save(): void {
        this.replayService.postReplay();
        this.replayService.stop();
        this.router.navigateByUrl('/home');
    }

    exit(): void {
        this.selectSpeed(Speed.NORMAL);
        this.replayService.stop();
        this.replayService.storeActions = true;
        this.router.navigateByUrl('/home');
    }

    restart(): void {
        this.replayService.restart();
        this.paused = false;
    }

    pause(): void {
        if (!this.ended) {
            this.replayService.pause();
            this.paused = true;
        }
    }

    resume(): void {
        if (!this.ended) {
            this.replayService.resume();
            this.paused = false;
        }
    }

    selectSpeed(speed: Speed) {
        this.speed = speed;
        this.replayService.changeSpeed(speed);
    }

    private processNextTimeJump(): void {
        if (this.timeJumpQueue.length > 0) {
            const clickedTime = this.timeJumpQueue.shift();
            if (clickedTime !== undefined) {
                this.restoreGameStateToTime(clickedTime);
                this.resetGameTimeToNearestRecordedTime(clickedTime);
            }
        }
    }
}
