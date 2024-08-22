// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { Router } from '@angular/router';
// import { ReplayService } from '@app/services/game-play/replay.service';

// import { Component, Input } from '@angular/core';
// import { PostItComponent } from '@app/components/general/post-it/post-it.component';
// import { GameTimeService } from '@app/services/game-play/game-time.service';
// import { Speed } from '@common/enums/game-play/speed';
// import { ReplayAreaComponent } from './replay-area.component';

// @Component({ selector: 'app-page-title', template: '' })
// class PageTitleStubComponent {
//     @Input() pageTitle: string;
// }
// describe('ReplayAreaComponent', () => {
//     let component: ReplayAreaComponent;
//     let fixture: ComponentFixture<ReplayAreaComponent>;
//     let routerSpy: jasmine.SpyObj<Router>;
//     let replayServiceSpy: jasmine.SpyObj<ReplayService>;
//     let gameTimeServiceSpy: jasmine.SpyObj<GameTimeService>;

//     beforeEach(async () => {
//         routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
//         replayServiceSpy = jasmine.createSpyObj('ReplayService', ['stop', 'restart', 'pause', 'resume', 'changeSpeed']);
//         gameTimeServiceSpy = jasmine.createSpyObj('GameTimeService', { recordedTimeIndex: 1, recordedTimes: [1, 1] });

//         spyOn(Math, 'floor').and.returnValue(1);

//         await TestBed.configureTestingModule({
//             declarations: [ReplayAreaComponent, PageTitleStubComponent, PostItComponent],
//             providers: [
//                 { provide: Router, useValue: routerSpy },
//                 { provide: ReplayService, useValue: replayServiceSpy },
//                 { provide: GameTimeService, useValue: gameTimeServiceSpy },
//             ],
//         }).compileComponents();

//         fixture = TestBed.createComponent(ReplayAreaComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

//     it('should stop replay and navigate to home when exiting', () => {
//         component.exit();
//         expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/home');
//         expect(replayServiceSpy.stop).toHaveBeenCalled();
//     });

//     it('should restart replay and set paused to false when clicking on restart', () => {
//         component.paused = true;
//         component.restart();
//         expect(replayServiceSpy.restart).toHaveBeenCalled();
//         expect(component.paused).toBeFalsy();
//     });

//     it('should resume replay and set paused to false when clicking on resume if replay is not ended', () => {
//         component.paused = true;
//         replayServiceSpy.isReplaying = true;
//         component.resume();
//         expect(replayServiceSpy.resume).toHaveBeenCalled();
//         expect(component.paused).toBeFalsy();
//     });

//     it('should not resume replay when clicking on resume if replay is ended', () => {
//         component.paused = true;
//         replayServiceSpy.isReplaying = false;
//         component.resume();
//         expect(replayServiceSpy.resume).not.toHaveBeenCalled();
//         expect(component.paused).toBeTruthy();
//     });

//     it('should pause replay and set paused to true when clicking on pause if replay is not ended', () => {
//         component.paused = false;
//         replayServiceSpy.isReplaying = true;
//         component.pause();
//         expect(replayServiceSpy.pause).toHaveBeenCalled();
//         expect(component.paused).toBeTruthy();
//     });

//     it('should not pause replay when clicking on pause if pause is ended', () => {
//         component.paused = false;
//         replayServiceSpy.isReplaying = false;
//         component.pause();
//         expect(replayServiceSpy.pause).not.toHaveBeenCalled();
//         expect(component.paused).toBeFalsy();
//     });

//     it('selectSpeed should change speed', () => {
//         const speed = Speed.X2;
//         component.selectSpeed(speed);
//         expect(component.speed).toEqual(speed);
//         expect(replayServiceSpy.changeSpeed).toHaveBeenCalledWith(speed);
//     });
// });
