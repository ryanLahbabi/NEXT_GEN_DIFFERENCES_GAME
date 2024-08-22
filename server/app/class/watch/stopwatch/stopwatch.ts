import Watch from '@app/class/watch/watch/watch';

export default class StopWatch extends Watch {
    getIntervalFunction(): () => void {
        return () => {
            if (!this.isPaused) {
                this.filterNegatives();
                this.seconds += this.tick;
                if (this.eachInterval) this.eachInterval();
            }
        };
    }

    start() {
        this.paused = false;
        this.clock = setInterval(this.getIntervalFunction(), this.delayMs);
    }
}
