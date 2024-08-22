/* eslint-disable @typescript-eslint/no-explicit-any */
// import { TestBed } from '@angular/core/testing';
// import { PlayAreaComponent } from '@app/components/game-play/play-area/play-area.component';
// import { SocketClientService } from '@app/services/communication/socket-client.service';
// import { GameService } from './game.service';
// import { ReplayService } from './replay.service';
// import SpyObj = jasmine.SpyObj;

// describe('GameService', () => {
//     let service: GameService;
//     let playAreaComponentSpy: SpyObj<PlayAreaComponent>;
//     let socketServiceSpy: SpyObj<SocketClientService>;
//     let replayServiceSpy: SpyObj<ReplayService>;

//     beforeEach(() => {
//         playAreaComponentSpy = jasmine.createSpyObj('PlayAreaComponent', ['showErrorMessage']);
//         socketServiceSpy = jasmine.createSpyObj('SocketClientService', ['on']);
//         replayServiceSpy = jasmine.createSpyObj('ReplayService', ['doAndStore']);
//     });

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             providers: [
//                 { provide: SocketClientService, useValue: socketServiceSpy },
//                 { provide: ReplayService, useValue: replayServiceSpy },
//             ],
//         });
//         service = TestBed.inject(GameService);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     it('showErrorMessage should call showErrorMessage of PlayArea', () => {
//         service.lastClickArea = playAreaComponentSpy;
//         service.showErrorMessage();
//         expect(playAreaComponentSpy.showErrorMessage).toHaveBeenCalled();
//     });

//     it('should emit a differences found event', () => {
//         spyOn(service.differenceFoundEvent, 'emit');
//         service.incrementDifferencesFound({ differenceNaturalOverlay: '', differenceFlashOverlay: '' });
//         expect(service.differenceFoundEvent.emit).toHaveBeenCalled();
//     });

//     it('should emit cheat images', () => {
//         spyOn(service.cheatEvent, 'emit');
//         service.cheat(['', '']);
//         expect(service.cheatEvent.emit).toHaveBeenCalled();
//     });
//     it('should emit cheat images', () => {
//         spyOn(service.removeCheatEvent, 'emit');
//         service.removeCheatIndex(0);
//         expect(service.removeCheatEvent.emit).toHaveBeenCalledWith(0);
//     });

//     it('should emit a hintEvent when it receives a hint', () => {
//         const fakeHint = { start: { x: 0, y: 10 }, end: { x: 100, y: 90 } };
//         service.hintsLeft = 1;
//         spyOn(service.hintEvent, 'emit');
//         service['receiveHint'](fakeHint);
//         expect(service.hintEvent.emit).toHaveBeenCalledWith(fakeHint);
//     });

//     it('should create false hints and emit them if this is the last hint', () => {
//         const fakeHint = { start: { x: 0, y: 10 }, end: { x: 100, y: 90 } };
//         service.hintsLeft = 0;
//         spyOn(service.hintEvent, 'emit');
//         const createFalseHintSpy = spyOn<any>(service, 'createFalseHint');
//         service['receiveHint'](fakeHint);
//         expect(service.hintEvent.emit).toHaveBeenCalledTimes(3);
//         expect(createFalseHintSpy).toHaveBeenCalledTimes(2);
//     });

//     it(
//         'createFalseHint should create a hint with random position and same dimension as the real hint,' +
//             +' and that does not overlap with other hints',
//         () => {
//             const fakeHint = { start: { x: 0, y: 10 }, end: { x: 100, y: 90 } };
//             const hints = [fakeHint];
//             const isOverlappingSpy = spyOn<any>(service, 'isOverlapping');
//             const randomSpy = spyOn<any>(service, 'random');
//             service['createFalseHint'](fakeHint, hints);
//             expect(isOverlappingSpy).toHaveBeenCalled();
//             expect(randomSpy).toHaveBeenCalled();
//         },
//     );

//     it('random should output a number between max and min', () => {
//         const MAX = 50;
//         const MIN = 10;
//         const NB_TRIES = 100;
//         for (let i = 0; i < NB_TRIES; i++) {
//             expect(service['random'](MIN, MAX)).toBeGreaterThanOrEqual(MIN);
//             expect(service['random'](MIN, MAX)).toBeLessThanOrEqual(MAX);
//         }
//     });

//     it('should detect overlapping rectangles', () => {
//         expect(
//             service['isOverlapping']({ start: { x: 0, y: 10 }, end: { x: 100, y: 90 } }, { start: { x: 50, y: 20 }, end: { x: 150, y: 80 } }),
//         ).toBeTruthy();
//         expect(
//             service['isOverlapping']({ start: { x: 0, y: 10 }, end: { x: 100, y: 90 } }, { start: { x: 50, y: 120 }, end: { x: 150, y: 180 } }),
//         ).toBeFalsy();
//     });
// });
