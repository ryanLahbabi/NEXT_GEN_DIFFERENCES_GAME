import { Injectable } from '@angular/core';
import { Timer } from '@app/classes/game-play/timer';
import { Speed } from '@common/enums/game-play/speed';

@Injectable({
    providedIn: 'root',
})
export class DelayService {
    timeIsPaused = false;
    private speed = Speed.NORMAL;
    private delays: Timer[] = [];
    private cycles: Timer[] = [];

    changeSpeed(speed: Speed): void {
        const timeWasPaused = this.timeIsPaused;
        this.pauseTime();
        this.speed = speed;
        this.delays.forEach((delay) => (delay.speed = this.speed));
        this.cycles.forEach((cycle) => (cycle.speed = this.speed));
        if (!timeWasPaused) this.resumeTime();
    }

    pauseTime(): void {
        this.pauseDelays();
        this.pauseCycles();
        this.timeIsPaused = true;
    }

    resumeTime(): void {
        this.delays.forEach((delay) => delay.resume());
        this.cycles.forEach((cycle) => cycle.resume());
        this.timeIsPaused = false;
    }

    clearDelays(): void {
        this.pauseDelays();
        this.delays = [];
    }

    clearCycles(): void {
        this.pauseCycles();
        this.cycles = [];
    }

    async wait(milliseconds: number) {
        let delayTimer: Timer;
        await new Promise((resolve) => {
            delayTimer = new Timer(resolve, { delay: milliseconds, speed: this.speed, repeat: false });
            this.delays.push(delayTimer);
        });
    }

    doCyclically(intervalMs: number, callBack: () => void) {
        this.cycles.push(new Timer(callBack, { delay: intervalMs, speed: this.speed, repeat: true }));
    }

    private pauseDelays() {
        this.delays.forEach((delay) => delay.pause());
    }

    private pauseCycles() {
        this.cycles.forEach((cycle) => cycle.pause());
    }
}
