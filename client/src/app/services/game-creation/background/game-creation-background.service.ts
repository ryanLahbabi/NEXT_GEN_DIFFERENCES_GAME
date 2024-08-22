import { Injectable } from '@angular/core';
import { EMPTY_IMAGE_URL } from '@app/constants/images-constants';
import { ImageIndex } from '@common/enums/game-creation/image-index';

@Injectable({
    providedIn: 'root',
})
export class GameCreationBackgroundService {
    private imageUrls: string[] = [];

    constructor() {
        this.clearImage(ImageIndex.Both);
    }

    setImageUrl(index: ImageIndex, url: string): void {
        if (index === ImageIndex.Both) {
            this.setImageUrl(ImageIndex.Original, url);
            this.setImageUrl(ImageIndex.Modified, url);
        } else {
            this.imageUrls[index] = url;
        }
    }

    getImageUrl(index: ImageIndex): string {
        return this.imageUrls[index];
    }

    clearImage(index: ImageIndex) {
        if (index === ImageIndex.Both) {
            this.clearImage(ImageIndex.Original);
            this.clearImage(ImageIndex.Modified);
        } else {
            this.imageUrls[index] = EMPTY_IMAGE_URL;
        }
    }
}
