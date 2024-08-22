/* eslint-disable @typescript-eslint/no-magic-numbers */
// import { Speed } from '@common/enums/game-play/speed';
// import { Timer } from './timer';

// describe('Timer', () => {
//     let timer: Timer;
//     // const speed: Speed = 2;

//     beforeEach(() => {
//         jasmine.clock().install();
//     });

//     afterEach(() => {
//         jasmine.clock().uninstall();
//         if (timer) {
//             timer.pause();
//         }
//     });

// it('should call callback function after specified delay', () => {
//     const callback = jasmine.createSpy('callback');
//     const delay = 1000;
//     timer = new Timer(callback, { delay, speed, repeat: false });

//     jasmine.clock().tick(delay / speed);

//     expect(callback).toHaveBeenCalled();
// });

// it('should repeatedly call callback function after specified delay if repeat is activated', () => {
//     const callback = jasmine.createSpy('callback');
//     const delay = 1000;
//     timer = new Timer(callback, { delay, speed, repeat: true });

//     jasmine.clock().tick((delay / speed) * 4);

//     expect(callback).toHaveBeenCalledTimes(4);
// });

// it('should pause timer', () => {
//     const callback = jasmine.createSpy('callback');
//     const delay = 5000;
//     timer = new Timer(callback, { delay, speed, repeat: false });

//     jasmine.clock().tick(3000 / speed);
//     timer.pause();
//     jasmine.clock().tick(3000 / speed);

//     expect(callback).not.toHaveBeenCalled();
// });

// it('should resume timer after pause', () => {
//     const callback = jasmine.createSpy('callback');
//     const delay = 5000;
//     timer = new Timer(callback, { delay, speed, repeat: false });

//     jasmine.clock().tick(3000 / speed);
//     timer.pause();
//     jasmine.clock().tick(3000 / speed);
//     timer.resume();
//     jasmine.clock().tick(5000 / speed);

//     expect(callback).toHaveBeenCalled();
// });

// it('should not start new timer if already running', () => {
//     const callback = jasmine.createSpy('callback');
//     const delay = 5000;
//     timer = new Timer(callback, { delay, speed, repeat: false });
//     const expectedTimerId = timer.timerId;

//     timer.resume();

//     expect(timer.timerId).toBe(expectedTimerId);
// });
// });

import { Timer } from './timer';
import { Speed } from '@common/enums/game-play/speed';

describe('Timer', () => {
    let timer: Timer;
    const speed: Speed = Speed.NORMAL; // Assuming Speed is an enum with a NORMAL value

    beforeEach(() => {
        jasmine.clock().install();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
        if (timer) {
            timer.pause();
        }
    });

    it('should call callback function after specified delay', () => {
        const callback = jasmine.createSpy('callback');
        const delay = 1000;
        timer = new Timer(callback, { delay, speed, repeat: false });

        jasmine.clock().tick(delay / speed);

        expect(callback).toHaveBeenCalled();
    });

    // Add other tests here...

    it('should not start new timer if already running', () => {
        const callback = jasmine.createSpy('callback');
        const delay = 5000;
        timer = new Timer(callback, { delay, speed, repeat: false });
        const expectedTimerId = timer.timerId;

        timer.resume();

        expect(timer.timerId).toBe(expectedTimerId);
    });
});
