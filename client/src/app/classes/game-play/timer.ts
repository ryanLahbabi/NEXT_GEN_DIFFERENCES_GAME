import { Speed } from '@common/enums/game-play/speed';
import { TimerConfig } from '@app/interfaces/timer/timer-config';

export class Timer {
    speed: Speed;
    timerId: number | undefined;
    private start: number;
    private remaining: number;
    private callback: (value: unknown) => void;
    private repeat: boolean;

    constructor(callback: (value: unknown) => void, config: TimerConfig) {
        this.callback = callback;
        this.remaining = config.delay;
        this.speed = config.speed;
        this.repeat = config.repeat;
        this.resume();
    }

    pause() {
        if (!this.timerId) {
            return;
        }
        window.clearTimeout(this.timerId);
        this.timerId = undefined;
        if (!this.repeat) this.remaining -= (Date.now() - this.start) * this.speed;
    }

    resume() {
        if (this.timerId) {
            return;
        }
        this.start = Date.now();
        if (this.repeat) {
            this.timerId = window.setInterval(this.callback, this.remaining / this.speed);
        } else {
            this.timerId = window.setTimeout(this.callback, this.remaining / this.speed);
        }
    }
}
