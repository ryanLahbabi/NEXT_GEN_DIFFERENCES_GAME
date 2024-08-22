/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Pipe, PipeTransform } from '@angular/core';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { DelayService } from '@app/services/divers/delay.service';
// import { ImageFileService } from '@app/services/divers/image-file.service';
// import { GameService } from '@app/services/game-play/game.service';
// import { ReplayService } from '@app/services/game-play/replay.service';
// import { DifferencesFoundComponent } from './differences-found.component';
// import SpyObj = jasmine.SpyObj;

// @Pipe({ name: 'safeResourceUrl' })
// class SafeUrlStubPipe implements PipeTransform {
//     transform() {
//         return '';
//     }
// }

// describe('DifferencesFoundComponent', () => {
//     let component: DifferencesFoundComponent;
//     let fixture: ComponentFixture<DifferencesFoundComponent>;
//     let imageFileServiceSpy: SpyObj<ImageFileService>;
//     let delayServiceSpy: SpyObj<DelayService>;
//     let replayServiceSpy: SpyObj<ReplayService>;

//     beforeEach(async () => {
//         imageFileServiceSpy = jasmine.createSpyObj('ImageFileService', ['base64StringToUrl']);
//         delayServiceSpy = jasmine.createSpyObj('DelayService', ['wait']);
//         const replayEventSpy = jasmine.createSpyObj('EventEmitter', ['subscribe']);
//         replayServiceSpy = jasmine.createSpyObj('ReplayService', ['doAndStore', 'store'], { replayEvent: replayEventSpy });
//         await TestBed.configureTestingModule({
//             declarations: [DifferencesFoundComponent, SafeUrlStubPipe],
//             providers: [
//                 GameService,
//                 { provide: ImageFileService, useValue: imageFileServiceSpy },
//                 { provide: DelayService, useValue: delayServiceSpy },
//                 { provide: ReplayService, useValue: replayServiceSpy },
//             ],
//         }).compileComponents();

//         fixture = TestBed.createComponent(DifferencesFoundComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
// it('should flash the difference image when flashAndAddDifferenceFound is called', async () => {
//     const flashDifferenceSpy = spyOn<any>(component, 'flashDifference');
//     await component['flashAndAddDifferenceFound']({ differenceNaturalOverlay: '', differenceFlashOverlay: '' });
//     expect(flashDifferenceSpy).toHaveBeenCalled();
// });

// it('should add the natural overlay image if the component is for the modified image', async () => {
//     component.originalDifferencesUrls = [];
//     component.isModified = true;
//     await component['flashAndAddDifferenceFound']({ differenceNaturalOverlay: 'fakeOverlay', differenceFlashOverlay: 'fakeOverlay' });
//     expect(component.originalDifferencesUrls.length).toEqual(1);
// });

// it('should not add the natural overlay image if the component is for the original image', async () => {
//     component.originalDifferencesUrls = [];
//     component.isModified = false;
//     await component['flashAndAddDifferenceFound']({ differenceNaturalOverlay: '', differenceFlashOverlay: '' });
//     expect(component.originalDifferencesUrls.length).toEqual(0);
// });

// it('flashDifference should flash the difference image', async () => {
//     const NUMBER_FLASHES = 5;
//     const flashOnceSpy = spyOn<any>(component, 'flashOnce');
//     await component['flashDifference']('');
//     expect(flashOnceSpy).toHaveBeenCalledTimes(2 * NUMBER_FLASHES);
// });
// it('should call and store the call to flashCheatImages', () => {
//     const flashCheatImagesSpy = spyOn<any>(component, 'flashCheatImages');
//     component.gameService.cheating = false;
//     const data = ['test0', 'test1', 'test2'];
//     component['cheat'](data);
//     expect(replayServiceSpy.doAndStore).toHaveBeenCalled();
//     expect(flashCheatImagesSpy).toHaveBeenCalled();
// });

// it('should remove cheat image and store the action', () => {
//     spyOn(component, 'removeCheatImage' as never).and.callThrough();
//     component.cheatImages = ['test0', 'test1', 'test2'];
//     component['removeCheatImage'](1);
//     expect(component['removeCheatImage']).toHaveBeenCalledWith(1);
//     expect(component.cheatImages).toEqual(['test0', undefined, 'test2']);
// });
// it('should flash cheat images while cheating', async () => {
//     const flashCheatOnceSpy = spyOn<any>(component, 'flashCheatOnce').and.callFake(() => (component.gameService.cheating = false));
//     const data = ['test0', 'test1', 'test2'];
//     component.gameService.cheating = true;
//     await component['flashCheatImages'](data);
//     component.gameService.cheating = false;
//     expect(flashCheatOnceSpy).toHaveBeenCalled();
//     expect(component.cheatImages).toEqual(data);
// });

// it('should subscribe removeCheatEvent to removeCheatImage and unsubscribe when no longer cheating', async () => {
//     spyOn<any>(component, 'flashCheatOnce' as never).and.callFake(() => {
//         component.gameService.cheating = false;
//     });
//     const subscribeSpy = spyOn(component.gameService.removeCheatEvent, 'subscribe');
//     const fakeSubscription = jasmine.createSpyObj('Subscription', ['unsubscribe']);
//     subscribeSpy.and.returnValue(fakeSubscription);
//     const data = ['test0', 'test1', 'test2'];
//     component.gameService.cheating = true;
//     await component['flashCheatImages'](data);
//     expect(subscribeSpy).toHaveBeenCalled();
//     expect(fakeSubscription.unsubscribe).toHaveBeenCalled();
// });

// it('should fill and empty flash list when flashing all differences', async () => {
//     const test = jasmine.createSpy();
//     component.flashingDifferencesUrls.push = jasmine.createSpy().and.callFake(test);
//     const data = ['test0', 'test1', 'test2'];
//     component.cheatImages = data;
//     await component['flashCheatOnce']();
//     expect(test).toHaveBeenCalledTimes(data.length);
//     expect(component.flashingDifferencesUrls).toEqual([]);
// });
// });
