import Watch from '@app/class/watch/watch/watch';

export default class Timer extends Watch {
    getIntervalFunction(): () => void {
        return () => {
            if (!this.isPaused) {
                this.seconds -= this.tick;
                this.filterNegatives();
                if (this.eachInterval) this.eachInterval();
                if (this.hasNoTime()) {
                    if (this.onEnd) this.onEnd();
                    this.reset();
                }
            }
        };
    }

    start() {
        this.paused = false;
        this.clock = setInterval(this.getIntervalFunction(), this.delayMs);
    }
}
