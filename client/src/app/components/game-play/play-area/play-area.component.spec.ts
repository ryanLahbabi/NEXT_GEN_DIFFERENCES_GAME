/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-classes-per-file */
// import { Component, Input, Pipe, PipeTransform } from '@angular/core';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { PlayAreaComponent } from '@app/components/game-play/play-area/play-area.component';
// import { SocketClientService } from '@app/services/communication/socket-client.service';
// import { DelayService } from '@app/services/divers/delay.service';
// import { DrawService } from '@app/services/game-creation/foreground/draw.service';
// import { GameService } from '@app/services/game-play/game.service';
// import { ReplayService } from '@app/services/game-play/replay.service';
// import { ToServer } from '@common/socket-event-constants';
// import SpyObj = jasmine.SpyObj;

// let gameServiceSpy: SpyObj<GameService>;
// let socketServiceSpy: SpyObj<SocketClientService>;
// let delayServiceSpy: SpyObj<DelayService>;
// let replayServiceSpy: SpyObj<ReplayService>;
// let drawServiceSpy: SpyObj<DrawService>;

// @Component({ selector: 'app-differences-found', template: '' })
// class DifferenceFoundStubComponent {
//     @Input() isModified: boolean;
// }
// @Pipe({ name: 'safeResourceUrl' })
// class SafeUrlStubPipe implements PipeTransform {
//     transform() {
//         return '';
//     }
// }

// describe('PlayAreaComponent', () => {
//     let component: PlayAreaComponent;
//     let fixture: ComponentFixture<PlayAreaComponent>;

//     beforeEach(() => {
//         const hintEventSpy = jasmine.createSpyObj('EventEmitter', ['pipe']);
//         hintEventSpy.pipe.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));
//         gameServiceSpy = jasmine.createSpyObj('GameService', ['incrementDifferencesFound'], { hintEvent: hintEventSpy });
//         socketServiceSpy = jasmine.createSpyObj('SocketClientService', ['send']);
//         delayServiceSpy = jasmine.createSpyObj('DelayService', ['wait']);
//         const replayEventSpy = jasmine.createSpyObj('EventEmitter', ['subscribe']);
//         replayServiceSpy = jasmine.createSpyObj('ReplayService', ['doAndStore', 'store'], { replayEvent: replayEventSpy });
//         drawServiceSpy = jasmine.createSpyObj('DrawService', ['clearCanvas', 'fillRectangle', 'outlineRectangle']);
//     });

//     beforeEach(async () => {
//         await TestBed.configureTestingModule({
//             declarations: [PlayAreaComponent, SafeUrlStubPipe, DifferenceFoundStubComponent],
//             providers: [
//                 { provide: GameService, useValue: gameServiceSpy },
//                 { provide: SocketClientService, useValue: socketServiceSpy },
//                 { provide: DelayService, useValue: delayServiceSpy },
//                 { provide: ReplayService, useValue: replayServiceSpy },
//                 { provide: DrawService, useValue: drawServiceSpy },
//             ],
//         }).compileComponents();
//     });

//     beforeEach(() => {
//         fixture = TestBed.createComponent(PlayAreaComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should call requestServerCheck when mouseHitDetect is called', () => {
//         const spy = spyOn<any>(component, 'requestServerCheck');
//         component.mouseHitDetect(new MouseEvent('click'));
//         expect(spy).toHaveBeenCalled();
//     });
//     it('should call calculateErrorCoordinate when showErrorMessage', () => {
//         component['clickCoordinates'] = { x: 0, y: 0 };
//         const spy = spyOn<any>(component, 'calculateErrorCoordinate');
//         component.showErrorMessage();
//         expect(spy).toHaveBeenCalled();
//     });
//     it('requestServerCheck should send coordinates and gameID to server', () => {
//         component['clickCoordinates'] = { x: 1, y: 2 };
//         component['requestServerCheck'](component['clickCoordinates']);
//         const clickMessage = {
//             gameId: 0,
//             clickCoordinates: component['clickCoordinates'],
//         };
//         socketServiceSpy.send(ToServer.CLICK, clickMessage);
//         expect(socketServiceSpy.send).toHaveBeenCalledWith(ToServer.CLICK, clickMessage);
//     });
//     it('calculateErrorCoordinate should return 0', () => {
//         component['clickCoordinates'] = { x: 0, y: 1 };
//         const result = component['calculateErrorCoordinate'](component['clickCoordinates'].x, 2, 1);
//         expect(result).toEqual(0);
//     });
//     it('calculateErrorCoordinate should return boundary - messageDimension', () => {
//         component['clickCoordinates'] = { x: 1, y: 0 };
//         const result = component['calculateErrorCoordinate'](component['clickCoordinates'].x, 2, 1);
//         expect(result).toEqual(1 - 2);
//     });
//     it('calculateErrorCoordinate should return clickCoordinate - messageDimension / 2', () => {
//         component['clickCoordinates'] = { x: 3, y: 1 };
//         const result = component['calculateErrorCoordinate'](component['clickCoordinates'].x, 4, 6);
//         expect(result).toEqual(3 - 4 / 2);
//     });
//     it('should add hint and call displayHints and hideHint', async () => {
//         const fakeHint = { start: { x: 1, y: 2 }, end: { x: 3, y: 4 } };
//         const displayHintsSpy = spyOn<any>(component, 'displayHints');
//         const hideHintSpy = spyOn<any>(component, 'hideHint');
//         await component['addHint'](fakeHint);
//         expect(component['displayedHints']).toContain(fakeHint);
//         expect(displayHintsSpy).toHaveBeenCalled();
//         expect(hideHintSpy).toHaveBeenCalled();
//     });
//     it('hideHind should remove first hint and call displayHints', () => {
//         const fakeHint1 = { start: { x: 1, y: 2 }, end: { x: 3, y: 4 } };
//         const fakeHint2 = { start: { x: 5, y: 6 }, end: { x: 7, y: 8 } };
//         component['displayedHints'] = [fakeHint1, fakeHint2];
//         const displayHintsSpy = spyOn<any>(component, 'displayHints');
//         component['hideHint']();
//         expect(component['displayedHints']).toEqual([fakeHint2]);
//         expect(displayHintsSpy).toHaveBeenCalled();
//     });
//     it('displayHints should clearCanvas and draw the hints', () => {
//         const fakeHints = [
//             { start: { x: 1, y: 2 }, end: { x: 3, y: 4 } },
//             { start: { x: 5, y: 6 }, end: { x: 7, y: 8 } },
//         ];
//         component['displayedHints'] = fakeHints;
//         component['displayHints']();
//         expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
//         expect(drawServiceSpy.fillRectangle).toHaveBeenCalledTimes(fakeHints.length);
//     });
//     it('should reset', () => {
//         const fakeHint = { start: { x: 1, y: 2 }, end: { x: 3, y: 4 } };
//         component.errorIsVisible = true;
//         component['displayedHints'] = [fakeHint];
//         component['reset']();
//         expect(component.errorIsVisible).toEqual(false);
//         expect(component['displayedHints']).toEqual([]);
//     });
// });
