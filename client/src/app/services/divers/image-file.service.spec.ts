import { TestBed } from '@angular/core/testing';
import { Buffer } from 'buffer';
import { ImageFileService } from './image-file.service';

describe('ImageFileService', () => {
    let service: ImageFileService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ImageFileService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('fileToUrl should return a string', () => {
        expect(service.fileToUrl(new File([], 'test'))).toBeInstanceOf(String);
    });

    it('bufferToUrl should return a string', async () => {
        const buffer = await service.fileToBuffer(new File([], 'test'));
        expect(service.bufferToUrl(buffer)).toBeInstanceOf(String);
    });

    it('urlToFile should return a File', async () => {
        expect(await service.urlToFile('../../../assets/image_empty.bmp')).toBeInstanceOf(File);
    });

    it('fileToArrayBuffer should return an ArrayBuffer', async () => {
        expect(await service.fileToArrayBuffer(new File([], 'test'))).toBeInstanceOf(ArrayBuffer);
    });

    it('fileToBuffer should return a Buffer', async () => {
        expect(await service.fileToBuffer(new File([], 'test'))).toBeInstanceOf(Buffer);
    });

    it('urlToBuffer should return a Buffer', async () => {
        expect(await service.urlToBuffer('../../../assets/image_empty.bmp')).toBeInstanceOf(Buffer);
    });

    it('base64StringToUrl should return a string', () => {
        expect(service.base64StringToUrl('test')).toBeInstanceOf(String);
    });

    it('base64StringToUrl should return an empty string if given an empty string', () => {
        expect(service.base64StringToUrl('')).toEqual('');
    });

    it('the operations should be coherently revertable', async () => {
        const file = new File([], 'test');
        expect(await service.urlToFile(service.fileToUrl(file))).toEqual(file);
        expect(await service.urlToFile(service.bufferToUrl(await service.fileToBuffer(file)))).toEqual(file);
    });

    it('loadImage should return an image', async () => {
        expect(await service.loadImage('../../../assets/image_empty.bmp')).toBeInstanceOf(HTMLImageElement);
    });
});
