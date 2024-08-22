/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { SettingsService } from '@app/services/divers/settings.service';
import { Speed } from '@common/enums/game-play/speed';
import { Sound } from '@common/enums/sound.enum';

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    private playSpeed: Speed;
    private successSound: HTMLAudioElement;
    private errorSound: HTMLAudioElement;

    constructor(private readonly settingsService: SettingsService) {
        this.successSound = new Audio();
        this.errorSound = new Audio();
    }

    set speed(speed: Speed) {
        this.playSpeed = speed;
        this.successSound.playbackRate = speed;
        this.errorSound.playbackRate = speed;
    }

    playSuccess(): void {
        this.successSound = new Audio();
        this.successSound.volume = 0.2;
        this.successSound.src = this.settingsService.successSound;
        this.playSound(this.successSound);
    }

    playError(): void {
        this.errorSound = new Audio();
        this.errorSound.volume = 0.2;
        this.errorSound.src = this.settingsService.failureSound;
        this.playSound(this.errorSound);
    }

    pause() {
        this.successSound.pause();
        this.errorSound.pause();
    }

    resume() {
        if (this.isPlaying(this.successSound)) this.successSound.play().catch((e) => console.log('Error resuming success sound:', e));
        if (this.isPlaying(this.errorSound)) this.errorSound.play().catch((e) => console.error('Error resuming error sound:', e));
    }

    playSpecificSound = (sound: Sound): void => {
        let soundToPlay: HTMLAudioElement;

        if (sound.toString() === 'Yippee') {
            soundToPlay = new Audio('./assets/yippee.mp3');
        } else if (sound.toString() === 'Boiii') {
            soundToPlay = new Audio('./assets/boiii.mp3');
            setTimeout(() => {
                if (!soundToPlay.paused) {
                    soundToPlay.pause();
                    soundToPlay.currentTime = 0;
                }
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            }, 3000);
        } else {
            console.error(`No mp3 file found for: ${sound}`);
            return;
        }

        soundToPlay.volume = 0.2;
        this.playSound(soundToPlay);
    };

    private isPlaying(sound: HTMLAudioElement): boolean {
        return !sound.ended && sound.currentTime !== 0;
    }

    private playSound(sound: HTMLAudioElement): void {
        sound.currentTime = 0;
        sound.load();
        sound.playbackRate = this.playSpeed;
        sound.play().catch((error) => console.error('Error playing sound:', error));
    }
}
