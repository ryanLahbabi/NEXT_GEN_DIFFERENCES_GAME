/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Timer } from '@app/classes/game-play/timer';
import { Speed } from '@common/enums/game-play/speed';
import { DelayService } from './delay.service';

describe('DelayService', () => {
    let delayService: DelayService;
    const delayMock = jasmine.createSpyObj<Timer>('Timer', ['pause', 'resume']);
    const cycleMock = jasmine.createSpyObj<Timer>('Timer', ['pause', 'resume']);

    beforeEach(() => {
        delayService = new DelayService();
        delayService['delays'] = [delayMock];
        delayService['cycles'] = [cycleMock];
    });

    afterEach(() => {
        delayService.clearDelays();
    });

    it('should create', () => {
        expect(delayService).toBeTruthy();
    });

    it('should change the speed and update the timers', () => {
        delayService.timeIsPaused = false;
        const pauseTimeSpy = spyOn(delayService, 'pauseTime');
        const resumeTimeSpy = spyOn(delayService, 'resumeTime');
        const newSpeed = Speed.X4;
        delayService.changeSpeed(newSpeed);
        expect(pauseTimeSpy).toHaveBeenCalled();
        expect(resumeTimeSpy).toHaveBeenCalled();
        expect(delayService['speed']).toEqual(newSpeed);
        expect(delayMock.speed).toEqual(newSpeed);
        expect(cycleMock.speed).toEqual(newSpeed);
    });

    it('should wait for a specified number of milliseconds', (done) => {
        const milliseconds = 1000;
        const startTime = Date.now();

        delayService.wait(milliseconds).then(() => {
            const endTime = Date.now();
            const elapsed = endTime - startTime;
            expect(elapsed).toBeGreaterThanOrEqual(milliseconds);
            expect(elapsed).toBeLessThan(milliseconds + 50);
            done();
        });
    });

    it('should create a cycle timer', () => {
        const interval = 1000;
        const callBack = jasmine.createSpy();
        delayService['cycles'] = [];
        delayService.doCyclically(interval, callBack);
        expect(delayService['cycles'].length).toEqual(1);
        expect(delayService['cycles'][0]['callback']).toEqual(callBack);
        expect(delayService['cycles'][0]['remaining']).toEqual(interval);
    });

    it('should pause the delay timers', () => {
        delayService.wait(1000);
        delayService['pauseDelays']();
        expect(delayService['delays'][0].timerId).toBeUndefined();
    });

    it('should pause the cycle timers', () => {
        delayService.doCyclically(1000, jasmine.createSpy());
        delayService['pauseCycles']();
        expect(delayService['cycles'][0].timerId).toBeUndefined();
    });

    it('pauseTime should pause the delays and cycles', () => {
        delayService.timeIsPaused = false;
        const pauseDelaysSpy = spyOn<any>(delayService, 'pauseDelays');
        const pauseCyclesSpy = spyOn<any>(delayService, 'pauseCycles');
        delayService.pauseTime();
        expect(pauseDelaysSpy).toHaveBeenCalled();
        expect(pauseCyclesSpy).toHaveBeenCalled();
        expect(delayService.timeIsPaused).toEqual(true);
    });

    it('should clear all cycles', () => {
        const pauseCyclesSpy = spyOn<any>(delayService, 'pauseCycles');
        delayService.clearCycles();
        expect(delayService['cycles']).toEqual([]);
        expect(pauseCyclesSpy).toHaveBeenCalled();
    });

    it('should clear all delays', () => {
        const pauseDelaysSpy = spyOn<any>(delayService, 'pauseDelays');
        delayService.clearDelays();
        expect(delayService['delays']).toEqual([]);
        expect(pauseDelaysSpy).toHaveBeenCalled();
    });

    it('resumeTime should resume timers', () => {
        delayService.timeIsPaused = true;
        delayService.resumeTime();
        expect(delayMock.resume).toHaveBeenCalled();
        expect(delayService.timeIsPaused).toEqual(false);
    });
});
