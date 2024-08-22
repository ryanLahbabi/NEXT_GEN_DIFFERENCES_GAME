import { Injectable } from '@angular/core';
import { GameMode } from '@common/enums/game-play/game-mode';
import { CardFiles } from '@common/interfaces/game-card/card-files';
import { GameValues } from '@common/interfaces/game-play/game-values';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameDataService {
    observerNbr: number;
    isObserving: boolean = false;
    timeToStart: number;
    nextCardFile?: CardFiles;
    originalPicture: string;
    modifiedPicture: string;
    chronometerTime: number = 0;
    gameID: string;
    nbOfPlayers: number;
    differenceNbr: number;
    difficulty: string;
    name?: string;
    playerNames: string[];
    gameMode: GameMode;
    gameName: string;
    chronoTime: number;
    gameValues: GameValues;
    playerScores?: { name: string; score: number }[];
    foundDifferences?: string[];

    private originalDifferencesUrlsSource = new BehaviorSubject<string[]>([]);
    // eslint-disable-next-line @typescript-eslint/member-ordering
    originalDifferencesUrls$ = this.originalDifferencesUrlsSource.asObservable();

    private flashingDifferencesUrlsSource = new BehaviorSubject<string[]>([]);
    // eslint-disable-next-line @typescript-eslint/member-ordering
    flashingDifferencesUrls$ = this.flashingDifferencesUrlsSource.asObservable();

    private originalDifferencesUrlSource = new BehaviorSubject<string>('');
    // eslint-disable-next-line @typescript-eslint/member-ordering
    originalDifferencesUrl$ = this.originalDifferencesUrlSource.asObservable();

    setOriginalDifferencesUrls(urls: string[]): void {
        this.originalDifferencesUrlsSource.next(urls);
    }

    getOriginalDifferencesUrls(): string[] {
        return this.originalDifferencesUrlsSource.getValue();
    }

    setFlashingDifferencesUrls(urls: string[]): void {
        this.flashingDifferencesUrlsSource.next(urls);
    }

    getFlashingDifferencesUrls(): string[] {
        return this.flashingDifferencesUrlsSource.getValue();
    }
}
