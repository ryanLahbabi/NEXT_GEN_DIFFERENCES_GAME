import Timer from './timer';

describe('Timer', () => {
    let timer: Timer;
    const spyOnIsPaused = jest.spyOn(Timer.prototype, 'isPaused', 'get');
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
        timer = new Timer();
        timer.eachInterval = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('start', () => {
        it('should call setInterval and getIntervalFunction to set timer as well as unpause it', () => {
            const spyOnGetIntervalFunction = jest.spyOn(Timer.prototype, 'getIntervalFunction').mockReturnValue(() => undefined);
            timer.start();
            expect(spyOnGetIntervalFunction).toBeCalled();
            expect(setInterval).toBeCalledWith(timer.getIntervalFunction(), defaultTick);
            expect(timer.isPaused).toBeFalsy();
            spyOnGetIntervalFunction.mockRestore();
        });
    });

    describe('getIntervalFunction', () => {
        const spyOnHasNoTime = jest.spyOn(Timer.prototype, 'hasNoTime');
        const spyOnReset = jest.spyOn(Timer.prototype, 'reset');

        it('should return a function', () => {
            expect(typeof timer.getIntervalFunction()).toEqual('function');
        });

        describe('returned function', () => {
            it('should end if the timer is paused', () => {
                spyOnHasNoTime.mockReturnValue(false);
                spyOnIsPaused.mockReturnValue(true);
                timer.getIntervalFunction()();
                expect(spyOnIsPaused).toBeCalled();
                expect(spyOnHasNoTime).not.toBeCalled();
            });

            it('should call removeTime with one second', () => {
                spyOnIsPaused.mockReturnValue(false);
                spyOnHasNoTime.mockReturnValue(false);
                timer.getIntervalFunction()();
                expect(spyOnIsPaused).toBeCalled();
            });

            it('should call onEnd and reset if hasNoTime is true', () => {
                spyOnIsPaused.mockReturnValue(false);
                spyOnHasNoTime.mockReturnValue(true);
                timer.getIntervalFunction()();
                expect(spyOnIsPaused).toBeCalled();
                expect(spyOnReset).toBeCalled();
            });
        });
    });
});
