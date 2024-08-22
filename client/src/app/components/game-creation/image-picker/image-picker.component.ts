import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, OFFSET_BIT_DEPTH, OFFSET_HEIGHT, OFFSET_WIDTH, REQUIRED_BIT_DEPTH } from '@app/constants/images-constants';
import { ImageFileService } from '@app/services/divers/image-file.service';
import { GameCreationBackgroundService } from '@app/services/game-creation/background/game-creation-background.service';
import { ImageIndex } from '@common/enums/game-creation/image-index';

@Component({
    selector: 'app-image-picker',
    templateUrl: './image-picker.component.html',
    styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent {
    @ViewChild('imageInput') imageInput: ElementRef;
    @Input() imageIndex: ImageIndex;

    constructor(private imageFileService: ImageFileService, private gameCreationBackgroundService: GameCreationBackgroundService) {}

    clickOnImageInput(): void {
        this.imageInput.nativeElement.click();
    }

    async updateImageUrl() {
        const file: File = this.imageInput.nativeElement.files[0];
        if (file && (await this.isValidImage(file))) {
            this.gameCreationBackgroundService.setImageUrl(this.imageIndex, this.imageFileService.fileToUrl(file));
        }
        this.imageInput.nativeElement.value = null;
    }

    private async isValidImage(file: File): Promise<boolean> {
        const datav = new DataView(await this.imageFileService.fileToArrayBuffer(file));
        return this.isValidBitDepth(datav) && this.isValidImageDimensions(datav);
    }

    private isValidBitDepth(datav: DataView): boolean {
        const bitCount = datav.getUint16(OFFSET_BIT_DEPTH, true);

        if (bitCount === REQUIRED_BIT_DEPTH) {
            return true;
        } else {
            alert("ERREUR: L'image doit être dans un format bitmap (BMP) 24-bit.");
            return false;
        }
    }

    private isValidImageDimensions(datav: DataView): boolean {
        const width = Math.abs(datav.getInt32(OFFSET_WIDTH, true));
        const height = Math.abs(datav.getInt32(OFFSET_HEIGHT, true));

        if (width === DEFAULT_WIDTH && height === DEFAULT_HEIGHT) {
            return true;
        } else {
            alert("ERREUR: L'image doit avoir une taille de 640 x 480 pixels.");
            return false;
        }
    }
}
