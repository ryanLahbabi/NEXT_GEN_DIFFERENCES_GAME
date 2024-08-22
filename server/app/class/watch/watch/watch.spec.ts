/* eslint-disable @typescript-eslint/no-magic-numbers */
import Watch from './watch';
import { oneMinuteInSeconds, oneSecondInMilliseconds, toPositiveInteger } from './watch.constants';

class FakeWatch extends Watch {
    get getClock() {
        return this.clock;
    }

    setPauseValue(value: boolean) {
        this.paused = value;
    }

    setRawSeconds(seconds: number) {
        this.seconds = seconds;
    }

    setClock() {
        this.clock = setInterval(() => undefined, oneSecondInMilliseconds);
    }
}

describe('Watch.constants', () => {
    describe('toPositiveInteger', () => {
        it('should return a positive Integer', () => {
            const negativeFloat = -1.2;
            expect(toPositiveInteger(negativeFloat)).toEqual(1);
        });
    });
});

describe('Watch', () => {
    let watch: FakeWatch;
    const seconds = 10;
    const minutes = 10;
    const time = seconds + minutes * oneMinuteInSeconds;

    beforeAll(() => {
        Object.defineProperty(global, 'performance', {
            value: jest.fn(),
            configurable: true,
            writable: true,
        });
        jest.useFakeTimers();
        jest.spyOn(global, 'clearInterval');
    });

    beforeEach(() => {
        watch = new FakeWatch();
        watch.setRawSeconds(time);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getTicks', () => {
        it('should return the seconds', () => {
            expect(Math.floor(watch.getTicks)).toEqual(watch.getSeconds);
        });
    });

    describe('getTime', () => {
        it('should returned a copy of the time', () => {
            expect(watch.getTime).toEqual({ seconds, minutes });
        });
    });

    describe('set', () => {
        it('should adjust and set the time', () => {
            const newTime = -5.5;
            const expectedTime = 5;
            watch.set(newTime);
            expect(watch.getSeconds).toEqual(expectedTime);
        });
    });

    describe('pause', () => {
        it('should set pause to true', () => {
            watch.setPauseValue(false);
            watch.pause();
            expect(watch.isPaused).toBeTruthy();
        });

        it('should still be paused', () => {
            watch.setPauseValue(true);
            watch.pause();
            expect(watch.isPaused).toBeTruthy();
        });
    });

    describe('add', () => {
        let timeToAdd: number;
        let expectedTime: number;
        let max: number;

        afterEach(() => {
            expect(watch.add(timeToAdd, max)).toBe(watch);
            expect(watch.getSeconds).toEqual(expectedTime);
            max = undefined;
        });

        it('should add time', () => {
            timeToAdd = 10;
            expectedTime = time + 10;
        });

        it('should not add time', () => {
            max = 10;
            timeToAdd = 11;
            expectedTime = 10;
        });

        it('should adjust the time to add if its seconds are negative and/or a float', () => {
            timeToAdd = -10.4;
            expectedTime = time + 10;
        });
    });

    describe('removeTime', () => {
        let timeToRemove: number;
        let expectedTime: number;

        afterEach(() => {
            expect(watch.remove(timeToRemove)).toBe(watch);
            expect(watch.getSeconds).toEqual(expectedTime);
        });

        it('should remove time', () => {
            timeToRemove = 5;
            expectedTime = time - 5;
        });

        it('should adjust the time to remove if its seconds are negative and/or a float', () => {
            timeToRemove = -5.5;
            expectedTime = time - 5;
        });

        it('should set the time to zero if resulting minutes are negative', () => {
            timeToRemove = time + 10;
            expectedTime = 0;
        });
    });

    describe('hasMoreTimeThan', () => {
        let timeToCompare: number;
        let expectedResponse: boolean;

        afterEach(() => {
            watch.hasMoreTimeThan(timeToCompare);
            expect(watch.hasMoreTimeThan(timeToCompare)).toEqual(expectedResponse);
        });

        it('should return true if the seconds are greater', () => {
            timeToCompare = time - 10;
            expectedResponse = true;
        });

        it('should return false if the seconds are equal', () => {
            timeToCompare = time;
            expectedResponse = false;
        });

        it('should return false if the seconds are smaller', () => {
            timeToCompare = time + 10;
            expectedResponse = false;
        });
    });

    describe('hasNoTime', () => {
        it('should return true if the seconds are null', () => {
            watch.setRawSeconds(0);
            expect(watch.hasNoTime()).toBeTruthy();
        });

        it('should return false if the seconds are not null', () => {
            watch.setRawSeconds(10);
            expect(watch.hasNoTime()).toBeFalsy();
        });
    });

    describe('reset', () => {
        it('should pause the watch and set the time to 0', () => {
            const spyOnPause = jest.spyOn(FakeWatch.prototype, 'pause').mockImplementation();
            watch.reset();
            expect(spyOnPause).toBeCalled();
            expect(watch.getSeconds).toEqual(0);
        });

        it('should clear the clock if it is not undefined and set it undefined', () => {
            watch.setClock();
            watch.reset();
            expect(clearInterval).toBeCalled();
            expect(watch.getClock).toBeUndefined();
        });
    });
});
