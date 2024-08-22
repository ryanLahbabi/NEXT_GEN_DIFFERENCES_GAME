/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageFileService } from '@app/services/divers/image-file.service';
import { GameCreationBackgroundService } from '@app/services/game-creation/background/game-creation-background.service';
import { ImagePickerComponent } from './image-picker.component';
import SpyObj = jasmine.SpyObj;

let imageFileService: ImageFileService;
let gameCreationBackgroundServiceSpy: SpyObj<GameCreationBackgroundService>;

beforeEach(() => {
    gameCreationBackgroundServiceSpy = jasmine.createSpyObj('GameCreationBackgroundService', ['setImageUrl']);
    imageFileService = new ImageFileService();
    spyOn(imageFileService, 'fileToUrl').and.callFake(() => '');
});

describe('ImagePickerComponent', () => {
    let component: ImagePickerComponent;
    let fixture: ComponentFixture<ImagePickerComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ImagePickerComponent],
            providers: [
                { provide: ImageFileService, useValue: imageFileService },
                { provide: GameCreationBackgroundService, useValue: gameCreationBackgroundServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ImagePickerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should trigger a click on the hidden file input when the component is clicked', async () => {
        const fileInput = component.imageInput.nativeElement;
        const clickSpy = spyOn(fileInput, 'click');
        component.clickOnImageInput();
        expect(clickSpy).toHaveBeenCalled();
    });

    it('should update the saved image url if the file is valid', async () => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(new File([''], 'test'));
        component.imageInput.nativeElement.files = dataTransfer.files;
        spyOn<any>(component, 'isValidImage').and.callFake(async () => true);
        await component.updateImageUrl();
        expect(gameCreationBackgroundServiceSpy.setImageUrl).toHaveBeenCalled();
    });

    it('should not update the saved image url if the file is not valid', async () => {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(new File([''], 'test'));
        component.imageInput.nativeElement.files = dataTransfer.files;
        spyOn<any>(component, 'isValidImage').and.callFake(async () => false);
        await component.updateImageUrl();
        expect(gameCreationBackgroundServiceSpy.setImageUrl).not.toHaveBeenCalled();
    });

    it('isValidImage should call isValidDepth and isValidImageDimensions', async () => {
        const isValidDepthSpy = spyOn<any>(component, 'isValidBitDepth').and.returnValue(true);
        const isValidImageDimensionsSpy = spyOn<any>(component, 'isValidImageDimensions').and.returnValue(true);
        const fileStub = new File([], 'image');
        await component['isValidImage'](fileStub);
        expect(isValidDepthSpy).toHaveBeenCalled();
        expect(isValidImageDimensionsSpy).toHaveBeenCalled();
    });

    it('image should be valid if bit depth and dimensions are valid', async () => {
        spyOn<any>(component, 'isValidBitDepth').and.returnValue(true);
        spyOn<any>(component, 'isValidImageDimensions').and.returnValue(true);
        const fileStub = new File([], 'image');
        const isValid = await component['isValidImage'](fileStub);
        expect(isValid).toBeTruthy();
    });

    it('image should not be valid if bit depth is not valid', async () => {
        spyOn<any>(component, 'isValidBitDepth').and.returnValue(false);
        spyOn<any>(component, 'isValidImageDimensions').and.returnValue(true);
        const fileStub = new File([], 'image');
        const isValid = await component['isValidImage'](fileStub);
        expect(isValid).toBeFalsy();
    });

    it('image should not be valid if dimensions are not valid', async () => {
        spyOn<any>(component, 'isValidBitDepth').and.returnValue(true);
        spyOn<any>(component, 'isValidImageDimensions').and.returnValue(false);
        const fileStub = new File([], 'image');
        const isValid = await component['isValidImage'](fileStub);
        expect(isValid).toBeFalsy();
    });

    it('image should not be valid if dimensions and bit depth are not valid', async () => {
        spyOn<any>(component, 'isValidBitDepth').and.returnValue(false);
        spyOn<any>(component, 'isValidImageDimensions').and.returnValue(false);
        const fileStub = new File([], 'image');
        const isValid = await component['isValidImage'](fileStub);
        expect(isValid).toBeFalsy();
    });

    it('a 24-bit image should have a valid bit depth', async () => {
        const validImage = await imageFileService.fileToArrayBuffer(await imageFileService.urlToFile('../../../assets/image_empty.bmp'));
        expect(component['isValidBitDepth'](new DataView(validImage))).toBeTruthy();
    });

    it('an image that is not 24-bit should not have a valid bit depth', async () => {
        spyOn(window, 'alert');
        const invalidImage = await imageFileService.fileToArrayBuffer(await imageFileService.urlToFile('../../../assets/image_wrong_bit_depth.bmp'));
        expect(component['isValidBitDepth'](new DataView(invalidImage))).toBeFalsy();
    });

    it('a 640 x 480 image should have valid dimensions', async () => {
        const validImage = await imageFileService.fileToArrayBuffer(await imageFileService.urlToFile('../../../assets/image_empty.bmp'));
        expect(component['isValidImageDimensions'](new DataView(validImage))).toBeTruthy();
    });

    it('an image that is not 640 x 480 should not have valid dimensions', async () => {
        spyOn(window, 'alert');
        const invalidImage = await imageFileService.fileToArrayBuffer(await imageFileService.urlToFile('../../../assets/image_wrong_res.bmp'));
        expect(component['isValidImageDimensions'](new DataView(invalidImage))).toBeFalsy();
    });
});
