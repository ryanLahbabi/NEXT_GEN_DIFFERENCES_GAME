import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GameCreationDialogComponent } from '@app/components/game-creation/game-creation-dialog/game-creation-dialog.component';
import { DIALOG_CUSTOM_CONFIG } from '@app/constants/dialog-config';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/images-constants';
import { AccountService } from '@app/services/account/account.service';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { ImageFileService } from '@app/services/divers/image-file.service';
import { GameCreationBackgroundService } from '@app/services/game-creation/background/game-creation-background.service';
import { DrawService } from '@app/services/game-creation/foreground/draw.service';
import { ForegroundDataService } from '@app/services/game-creation/foreground/foreground-data.service';
import { ImageIndex } from '@common/enums/game-creation/image-index';
import { Difficulty } from '@common/enums/game-play/difficulty';
import { Language } from '@common/enums/user/language.enum';
import { CardValidationOutputDto } from '@common/interfaces/game-card/card-validation.dto';
import { FromServer, ToServer } from '@common/socket-event-constants';
import { Buffer } from 'buffer';

@Component({
    selector: 'app-game-creation-page',
    templateUrl: './game-creation-page.component.html',
    styleUrls: ['./game-creation-page.component.scss'],
})
export class GameCreationPageComponent implements OnInit, OnDestroy {
    @ViewChild('hiddenCanvas') hiddenCanvas: ElementRef;

    canRequestCardValidation = true;
    originalImageIndex = ImageIndex.Original;
    modifiedImageIndex = ImageIndex.Modified;
    bothImagesIndex = ImageIndex.Both;
    differenceRadius: number = 3;

    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    // eslint-disable-next-line max-params
    constructor(
        private dialog: MatDialog,
        private gameCreationBackgroundService: GameCreationBackgroundService,
        private imageFileService: ImageFileService,
        private client: SocketClientService,
        private router: Router,
        private foregroundDataService: ForegroundDataService,
        private drawService: DrawService,
        private accountService: AccountService,
    ) {}

    get canvasWidth(): number {
        return this.canvasSize.x;
    }

    get canvasHeight(): number {
        return this.canvasSize.y;
    }

    ngOnInit(): void {
        if (this.accountService.isLoggedIn) {
            this.client.on(FromServer.CARD_VALIDATION, this.openCreationDialog.bind(this));
            this.client.on(FromServer.CARD_CREATION, this.navigateToConfig.bind(this));
            this.gameCreationBackgroundService.clearImage(this.bothImagesIndex);
            this.foregroundDataService.reset();
        } else {
            this.router.navigateByUrl('/login');
        }
    }

    ngOnDestroy(): void {
        this.client.removeListener(FromServer.CARD_VALIDATION);
        this.client.removeListener(FromServer.CARD_CREATION);
    }

    swapForegrounds(): void {
        const currentForeground = this.foregroundDataService.foregroundData;
        this.foregroundDataService.changeState({ original: currentForeground.modified, modified: currentForeground.original });
    }

    updateDifferenceRadius(value: string): void {
        switch (value) {
            case '0':
                this.differenceRadius = 0;
                break;
            case '1':
                this.differenceRadius = 3;
                break;
            case '2':
                this.differenceRadius = 9;
                break;
            case '3':
                this.differenceRadius = 15;
                break;
        }
    }

    async sendDifferenceCalculationRequest() {
        if (this.canRequestCardValidation) {
            const imageBuffers = await this.getImageBuffers();
            this.canRequestCardValidation = false;
            this.client.send(ToServer.CARD_VALIDATION_REQUEST, {
                originalImage: imageBuffers.original,
                modifiedImage: imageBuffers.modified,
                range: this.differenceRadius,
            });
        }
    }

    private openCreationDialog(data: CardValidationOutputDto): void {
        const valid = data.valid;
        const differenceImage = data.differenceImage;
        const nbDifferences = data.differenceNbr;
        const difficulty = this.getDifficulty(data.difficulty as Difficulty);
        const dialogConfig = Object.assign({}, DIALOG_CUSTOM_CONFIG);
        dialogConfig.data = { valid, nbDifferences, differenceImage, difficulty };
        const dialogRef = this.dialog.open(GameCreationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(this.sendGameCreationRequest.bind(this));
    }

    private async sendGameCreationRequest(name: string): Promise<void> {
        this.canRequestCardValidation = true;
        if (name) {
            const imageBuffers = await this.getImageBuffers();
            this.client.send(ToServer.CARD_CREATION_REQUEST, {
                originalImage: imageBuffers.original,
                modifiedImage: imageBuffers.modified,
                range: this.differenceRadius,
                name,
            });
        }
    }

    private navigateToConfig(): void {
        this.router.navigateByUrl('/admin');
    }

    private getDifficulty(code: Difficulty): string {
        switch (code) {
            case Difficulty.Easy:
                if (this.accountService.userLanguage === Language.French) return 'facile';
                return 'easy';
            case Difficulty.Hard:
                if (this.accountService.userLanguage === Language.French) return 'difficile';
                return 'difficult';

            default:
                if (this.accountService.userLanguage === Language.French) return 'facile';
                return 'easy';
        }
    }

    private async getImageBuffers(): Promise<{ original: Buffer; modified: Buffer }> {
        const originalImage = await this.mergeLayers(
            this.gameCreationBackgroundService.getImageUrl(this.originalImageIndex),
            this.foregroundDataService.foregroundData.original,
        );
        const modifiedImage = await this.mergeLayers(
            this.gameCreationBackgroundService.getImageUrl(this.modifiedImageIndex),
            this.foregroundDataService.foregroundData.modified,
        );
        return { original: originalImage, modified: modifiedImage };
    }

    private async mergeLayers(backgroundUrl: string, foregroundUrl: string): Promise<Buffer> {
        if (foregroundUrl) {
            const context = this.hiddenCanvas.nativeElement.getContext('2d');
            await this.drawService.clearCanvas(this.canvasSize, context);
            this.drawService.drawImage(await this.imageFileService.loadImage(backgroundUrl), context);
            this.drawService.drawImage(await this.imageFileService.loadImage(foregroundUrl), context);
            return this.imageFileService.urlToBuffer(this.hiddenCanvas.nativeElement.toDataURL());
        } else {
            return this.imageFileService.urlToBuffer(backgroundUrl);
        }
    }
}
