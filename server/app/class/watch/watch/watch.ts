import { TimeConcept } from '@common/interfaces/general/time-concept';
import { DELAY, ONE_FIFTH, oneMinuteInSeconds, toPositiveInteger } from './watch.constants';

export default abstract class Watch {
    eachInterval: () => void;
    onEnd: () => void;
    protected clock: NodeJS.Timer;
    protected paused: boolean;
    protected seconds: number = 0;
    protected readonly delayMs: number = DELAY;
    protected readonly tick = ONE_FIFTH;

    get getTime(): TimeConcept {
        return { seconds: Math.floor(this.seconds) % oneMinuteInSeconds, minutes: Math.floor(this.seconds / oneMinuteInSeconds) };
    }

    get getSeconds(): number {
        return Math.floor(this.seconds);
    }

    get getTicks(): number {
        return this.seconds;
    }

    get isPaused() {
        return this.paused;
    }

    getIntervalFunction?(): () => void;

    start?(): void;

    set(seconds: number): Watch {
        this.seconds = toPositiveInteger(seconds);
        return this;
    }

    pause() {
        this.paused = true;
    }

    add(seconds: number, max?: number): Watch {
        const newTime = this.seconds + toPositiveInteger(seconds);
        if (newTime > max) this.seconds = max;
        else this.seconds = newTime;
        return this;
    }

    remove(seconds: number): Watch {
        const newTime = this.seconds - toPositiveInteger(seconds);
        if (newTime < 0) this.seconds = 0;
        else this.seconds = newTime;
        return this;
    }

    hasMoreTimeThan(seconds: number): boolean {
        return this.seconds > seconds;
    }

    hasNoTime(): boolean {
        return this.seconds <= 0;
    }

    filterNegatives() {
        if (this.seconds < 0) this.seconds = 0;
    }

    reset() {
        this.pause();
        this.seconds = 0;
        if (this.clock) {
            clearInterval(this.clock);
            this.clock = undefined;
        }
    }
}
