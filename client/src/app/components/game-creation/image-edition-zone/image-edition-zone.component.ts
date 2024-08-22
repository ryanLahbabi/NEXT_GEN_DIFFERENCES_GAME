import { Component, Input } from '@angular/core';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/images-constants';
import { GameCreationBackgroundService } from '@app/services/game-creation/background/game-creation-background.service';
import { ForegroundDataService } from '@app/services/game-creation/foreground/foreground-data.service';
import { ForegroundState } from '@common/interfaces/game-creation/foreground-state';
import { ImageIndex } from '@common/enums/game-creation/image-index';

@Component({
    selector: 'app-image-edition-zone',
    templateUrl: './image-edition-zone.component.html',
    styleUrls: ['./image-edition-zone.component.scss'],
})
export class ImageEditionZoneComponent {
    @Input() imageIndex: ImageIndex;
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    constructor(private gameCreationBackgroundService: GameCreationBackgroundService, private foregroundDataService: ForegroundDataService) {}

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    get imageUrl(): string {
        return this.gameCreationBackgroundService.getImageUrl(this.imageIndex);
    }

    clearImage(): void {
        this.gameCreationBackgroundService.clearImage(this.imageIndex);
    }

    clearForeground(): void {
        const currentForeground = this.foregroundDataService.foregroundData;
        let newForeground: ForegroundState;
        if (this.imageIndex === ImageIndex.Original) {
            newForeground = { original: '', modified: currentForeground.modified };
        } else {
            newForeground = { original: currentForeground.original, modified: '' };
        }
        this.foregroundDataService.changeState(newForeground);
    }

    copyForeground(): void {
        const currentForeground = this.foregroundDataService.foregroundData;
        let copiedData: string;
        if (this.imageIndex === ImageIndex.Original) {
            copiedData = currentForeground.original;
        } else {
            copiedData = currentForeground.modified;
        }
        this.foregroundDataService.changeState({ original: copiedData, modified: copiedData });
    }
}
