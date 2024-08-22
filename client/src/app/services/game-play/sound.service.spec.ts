/* eslint-disable @typescript-eslint/no-explicit-any */
// import { TestBed } from '@angular/core/testing';

// import { Speed } from '@common/enums/game-play/speed';
// import { SoundService } from './sound.service';

// describe('SoundService', () => {
//     let service: SoundService;

//     beforeEach(() => {
//         TestBed.configureTestingModule({});
//         service = TestBed.inject(SoundService);
//     });

//     it('should be created', () => {
//         const expectedVolume = 0.2;
//         expect(service).toBeTruthy();
//         expect(service['successSound'].src).toBeTruthy();
//         expect(service['errorSound'].src).toBeTruthy();
//         expect(service['successSound'].volume).toEqual(expectedVolume);
//         expect(service['errorSound'].volume).toEqual(expectedVolume);
//     });

//     it('set speed should set playSet and playBackRate of Audio elements', () => {
//         service.speed = Speed.X2;
//         expect(service['playSpeed']).toEqual(Speed.X2);
//         expect(service['successSound'].playbackRate).toEqual(Speed.X2);
//         expect(service['errorSound'].playbackRate).toEqual(Speed.X2);
//     });

//     it('playSuccess should play success sound', () => {
//         const playSoundSpy = spyOn<any>(service, 'playSound');
//         service.playSuccess();
//         expect(playSoundSpy).toHaveBeenCalledWith(service['successSound']);
//     });

//     it('playError should play error sound', () => {
//         const playSoundSpy = spyOn<any>(service, 'playSound');
//         service.playError();
//         expect(playSoundSpy).toHaveBeenCalledWith(service['errorSound']);
//     });

//     it('pause should pause sounds', () => {
//         const successPauseSpy = spyOn(service['successSound'], 'pause');
//         const errorPauseSpy = spyOn(service['errorSound'], 'pause');
//         service.pause();
//         expect(successPauseSpy).toHaveBeenCalled();
//         expect(errorPauseSpy).toHaveBeenCalled();
//     });

//     it('resume should play sounds if they were already playing', () => {
//         const successPlaySpy = spyOn(service['successSound'], 'play');
//         const errorPlaySpy = spyOn(service['errorSound'], 'play');
//         const isPlayingSpy = spyOn<any>(service, 'isPlaying').and.returnValue(true);
//         service.resume();
//         expect(isPlayingSpy).toHaveBeenCalledWith(service['successSound']);
//         expect(isPlayingSpy).toHaveBeenCalledWith(service['errorSound']);
//         expect(successPlaySpy).toHaveBeenCalled();
//         expect(errorPlaySpy).toHaveBeenCalled();
//     });

//     it('resume should not play sounds if they were not already playing', () => {
//         const successPlaySpy = spyOn(service['successSound'], 'play');
//         const errorPlaySpy = spyOn(service['errorSound'], 'play');
//         const isPlayingSpy = spyOn<any>(service, 'isPlaying').and.returnValue(false);
//         service.resume();
//         expect(isPlayingSpy).toHaveBeenCalledWith(service['successSound']);
//         expect(isPlayingSpy).toHaveBeenCalledWith(service['errorSound']);
//         expect(successPlaySpy).not.toHaveBeenCalled();
//         expect(errorPlaySpy).not.toHaveBeenCalled();
//     });

//     it('isPlaying should return true if the sound is not ended and its time is different from 0', () => {
//         const fakeAudio = new Audio();
//         fakeAudio.currentTime = 0;
//         expect(service['isPlaying'](fakeAudio)).toEqual(false);
//         fakeAudio.currentTime = 1;
//         expect(service['isPlaying'](fakeAudio)).toEqual(true);
//     });

// it('playSound should load the audio, set its speed and play it', () => {
//     const speed = Speed.X2;
//     const fakeAudio = new Audio();
//     spyOn(fakeAudio, 'play');
//     spyOn(fakeAudio, 'load');
//     service['playSpeed'] = speed;
//     service['playSound'](fakeAudio);
//     expect(fakeAudio.load).toHaveBeenCalled();
//     expect(fakeAudio.play).toHaveBeenCalled();
//     expect(fakeAudio.playbackRate).toEqual(speed);
// });
// });
