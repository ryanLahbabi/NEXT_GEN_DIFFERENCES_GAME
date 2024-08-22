import { Injectable } from '@angular/core';
import { Buffer } from 'buffer';

@Injectable({
    providedIn: 'root',
})
export class ImageFileService {
    fileToUrl(file: File): string {
        return URL.createObjectURL(file);
    }

    bufferToUrl(buffer: Buffer): string {
        return URL.createObjectURL(new Blob([buffer]));
    }

    async urlToFile(url: string): Promise<File> {
        const blob = await fetch(url).then(async (response) => response.blob());
        return new File([blob], 'image');
    }

    async urlToBuffer(url: string): Promise<Buffer> {
        return this.fileToBuffer(await this.urlToFile(url));
    }

    async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
        return file.arrayBuffer();
    }

    async fileToBuffer(file: File): Promise<Buffer> {
        return Buffer.from(await this.fileToArrayBuffer(file));
    }

    base64StringToUrl(base64: string): string {
        if (!base64) return '';
        return this.bufferToUrl(Buffer.from(base64, 'base64'));
    }

    async loadImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = src;
        });
    }
}
