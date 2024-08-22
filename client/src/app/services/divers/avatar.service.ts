import { Injectable } from '@angular/core';
import { PrivateUserDataDTO } from '@common/dto/user/private-user-data.dto';

@Injectable({
    providedIn: 'root',
})
export class AvatarService {
    userData: PrivateUserDataDTO;
    carouselImages: string[] = [
        './assets/avatar1.png',
        './assets/avatar2.png',
        './assets/avatar3.png',
        './assets/avatar4.png',
        './assets/avatar5.png',
        './assets/avatar6.png',
        './assets/avatar7.png',
        './assets/avatar8.png',
    ];

    init(userData: PrivateUserDataDTO) {
        this.userData = userData;
    }

    path(content?: string): string {
        const imagePath = content ? content : this.userData?.avatar;
        if (imagePath === 'avatar_placeholder' || imagePath === undefined || imagePath === '') {
            return 'assets/avatar-default.jpeg';
        } else {
            return imagePath;
        }
    }

    /**
     * @param url - The source image
     * @param aspectRatio - The aspect ratio
     * @return A Promise that resolves with the resulting image as a canvas element
     *
     * SOURCE: https://pqina.nl/blog/cropping-images-to-an-aspect-ratio-with-javascript/
     */
    async crop(url: string): Promise<string> {
        // we return a Promise that gets resolved with our canvas element
        return new Promise((resolve) => {
            // this image will hold our source image data
            const inputImage = new Image();
            // we want to wait for our image to load
            inputImage.onload = () => {
                // create a canvas that will present the output image
                const outputImage = document.createElement('canvas');

                // set it to the same size as the image
                const imageSize = 175;
                outputImage.width = imageSize;
                outputImage.height = imageSize;

                // draw our image at position 0, 0 on the canvas
                const ctx = outputImage.getContext('2d');

                const ratio = inputImage.naturalWidth / inputImage.naturalHeight;
                const revRation = 1 / ratio;
                ctx?.drawImage(
                    inputImage,
                    ratio > 1 ? (imageSize * (1 - ratio)) / 2 : 0,
                    ratio < 1 ? (imageSize * (1 - revRation)) / 2 : 0,
                    ratio > 1 ? imageSize * ratio : imageSize,
                    ratio < 1 ? imageSize * revRation : imageSize,
                );
                resolve(outputImage.toDataURL());
            };

            // start loading our image
            inputImage.src = url;
        });
    }
}
