import StopWatch from './stopwatch';

describe('StopWatch', () => {
    let stopWatch: StopWatch;
    const spyOnIsPaused = jest.spyOn(StopWatch.prototype, 'isPaused', 'get');
    const defaultTick = 200;

    beforeAll(() => {
        Object.defineProperty(global, 'performance', {
            value: jest.fn(),
            configurable: true,
            writable: true,
        });
        jest.useFakeTimers();
        jest.spyOn(global, 'setInterval');
        jest.spyOn(global, 'clearInterval');
    });

    beforeEach(() => {
        stopWatch = new StopWatch();
        stopWatch.eachInterval = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('start', () => {
        it('should call setInterval and getIntervalFunction to set timer as well as unpause it', () => {
            const spyOnGetIntervalFunction = jest.spyOn(StopWatch.prototype, 'getIntervalFunction').mockReturnValue(() => undefined);
            stopWatch.start();
            expect(spyOnGetIntervalFunction).toBeCalled();
            expect(setInterval).toBeCalledWith(stopWatch.getIntervalFunction(), defaultTick);
            expect(stopWatch.isPaused).toBeFalsy();
            spyOnGetIntervalFunction.mockRestore();
        });
    });

    describe('getIntervalFunction', () => {
        const spyOnAddTime = jest.spyOn(StopWatch.prototype, 'add');

        it('should return a function', () => {
            expect(typeof stopWatch.getIntervalFunction()).toEqual('function');
        });

        describe('returned function', () => {
            it('should end if the timer is paused', () => {
                spyOnIsPaused.mockReturnValue(true);
                stopWatch.getIntervalFunction()();
                expect(spyOnIsPaused).toBeCalled();
                expect(spyOnAddTime).not.toBeCalled();
            });

            it('should call addTime with one second', () => {
                spyOnIsPaused.mockReturnValue(false);
                stopWatch.getIntervalFunction()();
                expect(spyOnIsPaused).toBeCalled();
            });
        });
    });
});
