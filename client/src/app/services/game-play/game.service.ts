import { EventEmitter, Injectable } from '@angular/core';
import { PlayAreaComponent } from '@app/components/game-play/play-area/play-area.component';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { DifferenceImages } from '@common/interfaces/game-play/difference-images';
import { FromServer } from '@common/socket-event-constants';
import { Subscription } from 'rxjs';
import { ReplayService } from './replay.service';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    canCheat: boolean = true;
    totalDifferences: number;
    differencesFoundTotal = 0;
    lastClickArea: PlayAreaComponent;

    differenceFoundEvent: EventEmitter<DifferenceImages> = new EventEmitter<DifferenceImages>();
    cheatEvent: EventEmitter<(string | undefined)[]> = new EventEmitter<(string | undefined)[]>();
    removeCheatEvent: EventEmitter<number> = new EventEmitter<number>();

    private isCheating: boolean = false;
    private replaySubscription: Subscription;

    constructor(private socketService: SocketClientService, private replayService: ReplayService) {
        this.initializeReplayListener();
    }

    get cheating() {
        return this.isCheating;
    }

    set cheating(value: boolean) {
        if (this.canCheat) {
            this.isCheating = value;
            this.replayService.doAndStore('cheatingValue', value);
        }
    }

    init() {
        if (this.replayService.isReplayMode) {
            this.reset();
        } else {
            this.reset();
            this.socketService.on(FromServer.CHEAT_INDEX, this.removeCheatIndex.bind(this));
        }
    }

    showErrorMessage() {
        this.lastClickArea.showErrorMessage();
    }

    reset() {
        this.cheating = false;
        this.differencesFoundTotal = 0;
    }

    incrementDifferencesFound(differenceImages: DifferenceImages) {
        this.flashDifferences(differenceImages);
    }

    flashDifferences(differenceImages: DifferenceImages) {
        this.differenceFoundEvent.emit(differenceImages);
    }

    cheat(cheatImages: (string | undefined)[]) {
        this.cheatEvent.emit(cheatImages);
    }

    removeCheatIndex(index: number) {
        this.removeCheatEvent.emit(index);
    }

    cleanup() {
        if (this.replaySubscription) {
            this.replaySubscription.unsubscribe();
        }
    }

    private initializeReplayListener() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.replaySubscription = this.replayService.replayActionTrigger.subscribe((action: any) => {
            if (action.category === 'cheatingValue') {
                this.isCheating = action.input as boolean;
            }
        });
    }
}
