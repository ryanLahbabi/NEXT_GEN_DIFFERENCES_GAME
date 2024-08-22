import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/test-helpers/canvas-test-helper';
import { ImageFileService } from '@app/services/divers/image-file.service';
import { DrawService } from '@app/services/game-creation/foreground/draw.service';
import SpyObj = jasmine.SpyObj;

describe('DrawService', () => {
    let service: DrawService;
    let ctxStub: CanvasRenderingContext2D;
    let imageFileServiceSpy: SpyObj<ImageFileService>;

    const CANVAS_WIDTH = 500;
    const CANVAS_HEIGHT = 500;

    beforeEach(() => {
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        imageFileServiceSpy = jasmine.createSpyObj('ImageFileService', ['loadImage']);
        TestBed.configureTestingModule({
            providers: [{ provide: ImageFileService, useValue: imageFileServiceSpy }],
        });
        service = TestBed.inject(DrawService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('drawLine should call beginPath, moveTo, lineTo and stroke on the context', () => {
        const start = { x: 1, y: 2 };
        const end = { x: -3, y: 10 };
        const beginPathSpy = spyOn(ctxStub, 'beginPath');
        const moveToSpy = spyOn(ctxStub, 'moveTo');
        const lineToSpy = spyOn(ctxStub, 'lineTo');
        const strokeSpy = spyOn(ctxStub, 'stroke');
        service.drawLine(start, end, ctxStub);
        expect(beginPathSpy).toHaveBeenCalled();
        expect(moveToSpy).toHaveBeenCalledWith(start.x, start.y);
        expect(lineToSpy).toHaveBeenCalledWith(end.x, end.y);
        expect(strokeSpy).toHaveBeenCalled();
    });

    it('fillSquare should call fillRect on the context', () => {
        const center = { x: 5, y: -3 };
        const edgeSize = 4;
        const fillRectSpy = spyOn(ctxStub, 'fillRect');
        service.fillSquare(center, edgeSize, ctxStub);
        expect(fillRectSpy).toHaveBeenCalledWith(center.x - edgeSize / 2, center.y - edgeSize / 2, edgeSize, edgeSize);
    });

    it('fillRectangle should call fillRect on the context', () => {
        const corner = { x: 5, y: -3 };
        const dimensions = { x: 10, y: 20 };
        const fillRectSpy = spyOn(ctxStub, 'fillRect');
        service.fillRectangle(corner, dimensions, ctxStub);
        expect(fillRectSpy).toHaveBeenCalledWith(corner.x, corner.y, dimensions.x, dimensions.y);
    });

    it('outlineRectangle should call strokeRect on the context', () => {
        const corner = { x: 5, y: -3 };
        const dimensions = { x: 10, y: 20 };
        const strokeRectSpy = spyOn(ctxStub, 'strokeRect');
        service.outlineRectangle(corner, dimensions, ctxStub);
        expect(strokeRectSpy).toHaveBeenCalledWith(corner.x, corner.y, dimensions.x, dimensions.y);
    });

    it('fillShape should call lineTo as many times as corners + 1 to close the shape', () => {
        const corners = [
            { x: 0, y: 0 },
            { x: 10, y: -2 },
            { x: 3, y: 3 },
            { x: 4, y: 5 },
            { x: -1, y: 6 },
        ];
        spyOn(ctxStub, 'beginPath');
        spyOn(ctxStub, 'moveTo');
        spyOn(ctxStub, 'fill');
        const lineToSpy = spyOn(ctxStub, 'lineTo');
        service.fillShape(corners, ctxStub);
        expect(lineToSpy).toHaveBeenCalledTimes(corners.length + 1);
        corners.forEach((corner) => {
            expect(lineToSpy).toHaveBeenCalledWith(corner.x, corner.y);
        });
    });

    it('fillShape should call beginPath, moveTo and fill on the context', () => {
        const lastCorner = { x: -1, y: 6 };
        const corners = [{ x: 0, y: 0 }, { x: 10, y: -2 }, { x: 3, y: 3 }, { x: 4, y: 5 }, lastCorner];
        const beginPathSpy = spyOn(ctxStub, 'beginPath');
        const moveToSpy = spyOn(ctxStub, 'moveTo');
        const fillSpy = spyOn(ctxStub, 'fill');
        spyOn(ctxStub, 'lineTo');
        service.fillShape(corners, ctxStub);
        expect(beginPathSpy).toHaveBeenCalled();
        expect(moveToSpy).toHaveBeenCalledWith(lastCorner.x, lastCorner.y);
        expect(fillSpy).toHaveBeenCalled();
    });

    it('drawImage should call drawImage on the context', () => {
        const drawImageSpy = spyOn(ctxStub, 'drawImage');
        service.drawImage(new Image(), ctxStub);
        expect(drawImageSpy).toHaveBeenCalled();
    });

    it('clearCanvas should only call clearRect on the context if no foreground data is specified', async () => {
        const canvasDimensions = { x: 100, y: 200 };
        const clearRectSpy = spyOn(ctxStub, 'clearRect');
        await service.clearCanvas(canvasDimensions, ctxStub);
        expect(clearRectSpy).toHaveBeenCalledWith(0, 0, canvasDimensions.x, canvasDimensions.y);
    });

    it('clearCanvas should call loadImage, clearRect and drawImage if foreground data is specified', async () => {
        const drawImageSpy = spyOn(service, 'drawImage');
        const clearRectSpy = spyOn(ctxStub, 'clearRect');
        const initialForeground = 'test initial foreground data';
        const foregroundImageStub = new Image();
        foregroundImageStub.alt = 'test image';
        imageFileServiceSpy.loadImage.and.callFake(async () => foregroundImageStub);
        const canvasDimensions = { x: 100, y: 200 };
        await service.clearCanvas(canvasDimensions, ctxStub, initialForeground);
        expect(clearRectSpy).toHaveBeenCalledWith(0, 0, canvasDimensions.x, canvasDimensions.y);
        expect(imageFileServiceSpy.loadImage).toHaveBeenCalledWith(initialForeground);
        expect(drawImageSpy).toHaveBeenCalledWith(foregroundImageStub, ctxStub);
    });

    it('clearCanvas should clear pixels on the canvas if no foreground data is specified', async () => {
        ctxStub.beginPath();
        ctxStub.moveTo(0, 0);
        ctxStub.lineTo(3, 3);
        ctxStub.stroke();
        const canvasDimensions = { x: 100, y: 200 };
        let imageData = ctxStub.getImageData(0, 0, canvasDimensions.x, canvasDimensions.y).data;
        const sizeBefore = imageData.filter((x) => x !== 0).length;
        await service.clearCanvas(canvasDimensions, ctxStub);
        imageData = ctxStub.getImageData(0, 0, canvasDimensions.x, canvasDimensions.y).data;
        const sizeAfter = imageData.filter((x) => x !== 0).length;
        expect(sizeAfter).toEqual(0);
        expect(sizeAfter).toBeLessThan(sizeBefore);
    });
});
