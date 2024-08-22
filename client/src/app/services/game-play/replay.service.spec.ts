/* eslint-disable @typescript-eslint/no-explicit-any */
// import { TestBed } from '@angular/core/testing';
// import { DelayService } from '@app/services/divers/delay.service';
// import { Speed } from '@common/enums/game-play/speed';
// import { GameTimeService } from './game-time.service';
// import { ReplayService } from './replay.service';
// import { SoundService } from './sound.service';
// import SpyObj = jasmine.SpyObj;

// describe('ReplayService', () => {
//     let service: ReplayService;
//     let soundServiceSpy: SpyObj<SoundService>;
//     let gameTimeServiceSpy: SpyObj<GameTimeService>;
//     let delayServiceSpy: SpyObj<DelayService>;

//     beforeEach(() => {
//         soundServiceSpy = jasmine.createSpyObj('SoundService', ['pause', 'resume']);
//         delayServiceSpy = jasmine.createSpyObj(
//             'DelayService',
//             ['changeSpeed', 'doCyclically', 'wait', 'pauseTime', 'resumeTime', 'clearDelays', 'clearCycles'],
//             { timeIsPaused: false },
//         );
//         gameTimeServiceSpy = jasmine.createSpyObj('GameTimeService', ['nextRecordedTime'], {
//             recordedTimes: [],
//             replayTime: 0,
//             isReplayMode: true,
//             recordedTimeIndex: 0,
//         });
//         TestBed.configureTestingModule({
//             providers: [
//                 { provide: SoundService, useValue: soundServiceSpy },
//                 { provide: GameTimeService, useValue: gameTimeServiceSpy },
//                 { provide: DelayService, useValue: delayServiceSpy },
//             ],
//         });
//         service = TestBed.inject(ReplayService);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     it('should reset', () => {
//         const fakeAction = {
//             time: 150,
//             // eslint-disable-next-line @typescript-eslint/no-empty-function
//             category: 'test',
//             input: 1,
//         };
//         const stopSpy = spyOn(service, 'stop');
//         delayServiceSpy.timeIsPaused = true;
//         gameTimeServiceSpy.recordedTimes = [1, 2, 3];
//         service['replayActions'] = [fakeAction, fakeAction, fakeAction];
//         service.isReplaying = true;
//         service.isReplayMode = true;
//         service.reset();
//         expect(stopSpy).toHaveBeenCalled();
//         expect(delayServiceSpy.timeIsPaused).toEqual(false);
//         expect(gameTimeServiceSpy.recordedTimes).toEqual([]);
//         expect(delayServiceSpy.changeSpeed).toHaveBeenCalledWith(Speed.NORMAL);
//         expect(service.isReplaying).toEqual(false);
//         expect(service.isReplayMode).toEqual(false);
//     });

//     it('doAndStore should execute action and store it', () => {
//         const test = jasmine.createSpy();
//         const storeSpy = spyOn(service, 'store');
//         service.doAndStore('test', 1);
//         expect(storeSpy).toHaveBeenCalledWith('test', 1);
//         expect(test).toHaveBeenCalled();
//     });

//     it('store should add the replayAction to the list if it is not currently replaying', () => {
//         service.isReplaying = false;
//         service['replayActions'] = [];
//         service.store('test', 1);
//         expect(service['replayActions'].length).toEqual(1);
//     });

//     it('store should not add the replayAction to the list if it is currently replaying', () => {
//         service.storeActions = false;
//         service['replayActions'] = [];
//         service.store('test', 1);
//         expect(service['replayActions'].length).toEqual(0);
//     });

//     it('should pause time and sound when pausing replay', () => {
//         service.pause();
//         expect(delayServiceSpy.pauseTime).toHaveBeenCalled();
//         expect(soundServiceSpy.pause).toHaveBeenCalled();
//     });

//     it('should resume time and sound when resuming replay', () => {
//         service.resume();
//         expect(delayServiceSpy.resumeTime).toHaveBeenCalled();
//         expect(soundServiceSpy.resume).toHaveBeenCalled();
//     });

//     it('should stop and start replay when restarting', () => {
//         const stopSpy = spyOn(service, 'stop');
//         const replaySpy = spyOn<any>(service, 'replay');
//         service.restart();
//         expect(stopSpy).toHaveBeenCalled();
//         expect(replaySpy).toHaveBeenCalled();
//     });

//     it('endOfReplay should set isReplaying to false and clear the cycles of DelayService', () => {
//         service.isReplaying = true;
//         service.endOfReplay();
//         expect(service.isReplaying).toEqual(false);
//         expect(delayServiceSpy.clearCycles).toHaveBeenCalled();
//     });

//     it('should change speed of DelayService and SoundService', () => {
//         const speed = Speed.X2;
//         service.changeSpeed(speed);
//         expect(delayServiceSpy.changeSpeed).toHaveBeenCalledWith(speed);
//         expect(soundServiceSpy.speed).toEqual(speed);
//     });

//     it('should emit replayEvent when replaying', () => {
//         spyOn(service.replayEvent, 'emit');
//         service['replay']();
//         expect(service.replayEvent.emit).toHaveBeenCalled();
//     });

//     it('should create a cyclic timer when replaying', () => {
//         service['replay']();
//         expect(delayServiceSpy.doCyclically).toHaveBeenCalled();
//     });

//     it('should go to the next recorded time at each iteration of the cyclic timer', () => {
//         service['actionIndex'] = 0;
//         service['replayActions'] = [
//             {
//                 time: 0,
//                 category: 'test',
//                 input: 1,
//             },
//             {
//                 time: 120,
//                 category: 'test',
//                 input: 1,
//             },
//         ];
//         spyOn<any>(service, 'isSameTime').and.callFake((time1: number) => time1 === 0);
//         service['tick']();
//         expect(gameTimeServiceSpy.nextRecordedTime).toHaveBeenCalled();
//     });

//     it('should play the next recorded action if it happened at the same time as the current replaying time', () => {
//         service['actionIndex'] = 0;
//         const fakeAction1 = jasmine.createSpy();
//         const fakeAction2 = jasmine.createSpy();
//         service['replayActions'] = [
//             {
//                 time: 0,
//                 category: 'test',
//                 input: 1,
//             },
//             {
//                 time: 120,
//                 category: 'test',
//                 input: 1,
//             },
//         ];
//         const isSameTimeSpy = spyOn<any>(service, 'isSameTime').and.callFake((time1: number) => time1 === 0);
//         service['tick']();
//         expect(isSameTimeSpy).toHaveBeenCalled();
//         expect(service['actionIndex']).toEqual(1);
//         expect(fakeAction1).toHaveBeenCalled();
//         expect(fakeAction2).not.toHaveBeenCalled();
//     });
// });
