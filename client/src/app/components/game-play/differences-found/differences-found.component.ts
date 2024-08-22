import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NUMBER_FLASHES, ONE_FLASH_TIME } from '@app/constants/game-constants';
import { DelayService } from '@app/services/divers/delay.service';
import { ImageFileService } from '@app/services/divers/image-file.service';
import { GameDataService } from '@app/services/game-play/game-data.service';
import { GameService } from '@app/services/game-play/game.service';
import { ReplayService } from '@app/services/game-play/replay.service';
import { DifferenceImages } from '@common/interfaces/game-play/difference-images';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-differences-found',
    templateUrl: './differences-found.component.html',
    styleUrls: ['./differences-found.component.scss'],
})
export class DifferencesFoundComponent implements OnInit, OnDestroy {
    @Input() isModified: boolean;

    originalDifferencesUrls: string[];
    flashingDifferencesUrls: string[];
    flashingDifferenceUrl: string;
    cheatImages: (string | undefined)[];

    private componentDestroyed$: Subject<void> = new Subject<void>();

    // eslint-disable-next-line max-params
    constructor(
        public gameService: GameService,
        private imageFileService: ImageFileService,
        private replayService: ReplayService,
        private delayService: DelayService,
        private gameDataService: GameDataService,
    ) {
        this.gameService.cheating = false;
    }

    ngOnInit(): void {
        this.reset();
        if (this.replayService.isReplayMode) {
            this.originalDifferencesUrls = this.replayService.getterReplayInformationToRestore.gameDetails.originalDifferencesUrls;
        }
        this.gameService.differenceFoundEvent.pipe(takeUntil(this.componentDestroyed$)).subscribe(this.flashAndAddDifferenceFound.bind(this));
        this.gameService.cheatEvent.pipe(takeUntil(this.componentDestroyed$)).subscribe(this.cheat.bind(this));
        this.replayService.replayEvent.subscribe(this.reset.bind(this));
        this.gameDataService.originalDifferencesUrls$.pipe(takeUntil(this.componentDestroyed$)).subscribe((urls) => {
            this.originalDifferencesUrls = urls;
        });
        this.replayService.replayActionTrigger.pipe(takeUntil(this.componentDestroyed$)).subscribe((action) => {
            if (action.category === 'flashCheatImages') {
                this.flashCheatImages(action.input as (string | undefined)[]);
            } else if (action.category === 'removeCheatImage') {
                this.removeCheatImage(action.input as number);
            }
        });
        if (this.isModified && this.gameDataService.foundDifferences) {
            this.gameDataService.foundDifferences.forEach((difference) =>
                this.originalDifferencesUrls.push(this.imageFileService.base64StringToUrl(difference)),
            );
            this.gameDataService.foundDifferences = [];
        }
    }

    initializeReplayVariablesFromReplayService(): void {
        this.originalDifferencesUrls = this.replayService.getterReplayInformationToRestore.gameDetails.originalDifferencesUrls;
        this.flashingDifferencesUrls = this.replayService.getterReplayInformationToRestore.gameDetails.flashingDifferencesUrls;
        this.cheatImages = this.replayService.getterReplayInformationToRestore.gameDetails.cheatImages;
    }

    ngOnDestroy(): void {
        this.gameService.cleanup();
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
    }

    async flashCheatImages(flashingDifferencesUrls: (string | undefined)[]) {
        const subscription = this.gameService.removeCheatEvent.subscribe(this.removeCheatImage.bind(this));
        this.cheatImages = [];
        flashingDifferencesUrls.forEach((difference) => {
            this.cheatImages.push(difference);
        });
        while (this.gameService.cheating) {
            await this.flashCheatOnce();
        }
        subscription.unsubscribe();
    }

    private async flashAndAddDifferenceFound(differenceImages: DifferenceImages) {
        await this.flashDifference(differenceImages.differenceFlashOverlay);
        if (this.isModified) {
            const newUrl = this.imageFileService.base64StringToUrl(differenceImages.differenceNaturalOverlay);
            // Clone the current array, add the new URL, and update through GameDataService
            const updatedUrls = [...this.originalDifferencesUrls, newUrl];
            this.gameDataService.setOriginalDifferencesUrls(updatedUrls);
        }
    }

    private async flashDifference(differenceImageUrl: string) {
        for (let i = 0; i < NUMBER_FLASHES; i++) {
            await this.flashOnce(differenceImageUrl);
            await this.flashOnce('');
        }
    }

    private async flashOnce(differenceImageUrl: string) {
        this.flashingDifferenceUrl = this.imageFileService.base64StringToUrl(differenceImageUrl);
        await this.delayService.wait(ONE_FLASH_TIME);
    }

    private cheat(flashingDifferencesUrls: (string | undefined)[]) {
        this.replayService.doAndStore('flashCheatImages', flashingDifferencesUrls);
    }

    private async flashCheatOnce() {
        this.cheatImages.forEach((image) => {
            if (image) this.flashingDifferencesUrls.push(this.imageFileService.base64StringToUrl(image));
        });
        await this.delayService.wait(ONE_FLASH_TIME);
        this.flashingDifferencesUrls = [];
        await this.delayService.wait(ONE_FLASH_TIME);
    }

    private removeCheatImage(index: number) {
        this.replayService.store('removeCheatImage', index);
        this.cheatImages[index] = undefined;
    }

    private reset() {
        this.originalDifferencesUrls = [];
        this.flashingDifferencesUrls = [];
        this.flashingDifferenceUrl = '';
    }
}
