import { TestBed } from '@angular/core/testing';
import { ImageIndex } from '@common/enums/game-creation/image-index';
import { GameCreationBackgroundService } from './game-creation-background.service';

describe('GameCreationBackgroundService', () => {
    let service: GameCreationBackgroundService;
    let originalImageUrl: string;
    let modifiedImageUrl: string;
    const DEFAULT_URL = './assets/image_empty.bmp';

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameCreationBackgroundService);
        originalImageUrl = 'originalUrl';
        modifiedImageUrl = 'modifiedUrl';
        service['imageUrls'] = [originalImageUrl, modifiedImageUrl];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setImageUrl(ImageIndex.Original) should set the url of the original image', () => {
        const newUrl = 'test';
        service.setImageUrl(ImageIndex.Original, newUrl);
        expect(service['imageUrls'][0]).toEqual(newUrl);
        expect(service['imageUrls'][1]).toEqual(modifiedImageUrl);
    });

    it('setImageUrl(ImageIndex.Modified) should set the url of the modified image', () => {
        const newUrl = 'test';
        service.setImageUrl(ImageIndex.Modified, newUrl);
        expect(service['imageUrls'][1]).toEqual(newUrl);
        expect(service['imageUrls'][0]).toEqual(originalImageUrl);
    });

    it('setImageUrl(ImageIndex.Both) should set the url of the both images', () => {
        const newUrl = 'test';
        service.setImageUrl(ImageIndex.Both, newUrl);
        expect(service['imageUrls'][0]).toEqual(newUrl);
        expect(service['imageUrls'][1]).toEqual(newUrl);
    });

    it('setImageUrl(ImageIndex.Original) should get the url of the original image', () => {
        expect(service.getImageUrl(ImageIndex.Original)).toEqual(originalImageUrl);
    });

    it('setImageUrl(ImageIndex.Modified) should get the url of the modified image', () => {
        expect(service.getImageUrl(ImageIndex.Modified)).toEqual(modifiedImageUrl);
    });

    it('clearImage(ImageIndex.Original) should reset the url of the original image', () => {
        service.clearImage(ImageIndex.Original);
        expect(service['imageUrls'][0]).toEqual(DEFAULT_URL);
        expect(service['imageUrls'][1]).toEqual(modifiedImageUrl);
    });

    it('clearImage(ImageIndex.Modified) should reset the url of the modified image', () => {
        service.clearImage(ImageIndex.Modified);
        expect(service['imageUrls'][1]).toEqual(DEFAULT_URL);
        expect(service['imageUrls'][0]).toEqual(originalImageUrl);
    });

    it('clearImage(ImageIndex.Both) should reset the url of both images', () => {
        service.clearImage(ImageIndex.Both);
        expect(service['imageUrls'][0]).toEqual(DEFAULT_URL);
        expect(service['imageUrls'][1]).toEqual(DEFAULT_URL);
    });
});
