/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/test-helpers/canvas-test-helper';
import { DrawService } from '@app/services/game-creation/foreground/draw.service';
import { ForegroundDataService } from '@app/services/game-creation/foreground/foreground-data.service';
import { SelectedToolService } from '@app/services/game-creation/foreground/selected-tool.service';
import { ImageIndex } from '@common/enums/game-creation/image-index';
import { ForegroundState } from '@common/interfaces/game-creation/foreground-state';
import { DrawingAreaComponent } from './drawing-area.component';
import SpyObj = jasmine.SpyObj;

describe('DrawingAreaComponent', () => {
    let component: DrawingAreaComponent;
    let fixture: ComponentFixture<DrawingAreaComponent>;
    let foregroundDataServiceSpy: SpyObj<ForegroundDataService>;
    let drawServiceSpy: SpyObj<DrawService>;
    let selectedToolServiceSpy: SpyObj<SelectedToolService>;

    beforeEach(async () => {
        foregroundDataServiceSpy = jasmine.createSpyObj('ForegroundDataService', ['saveState'], {
            foregroundData: { original: 'original', modified: 'modified' },
            stateChangeEvent: new EventEmitter<ForegroundState>(),
        });
        drawServiceSpy = jasmine.createSpyObj('DrawService', ['clearCanvas']);
        selectedToolServiceSpy = jasmine.createSpyObj('SelectedToolService', ['saveState'], {
            selectedTool: jasmine.createSpyObj('AbstractToolService', ['onMouseUp', 'onMouseDown', 'onMouseMove', 'onKeyDown', 'onKeyUp']),
        });

        await TestBed.configureTestingModule({
            declarations: [DrawingAreaComponent],
            providers: [
                { provide: ForegroundDataService, useValue: foregroundDataServiceSpy },
                { provide: DrawService, useValue: drawServiceSpy },
                { provide: SelectedToolService, useValue: selectedToolServiceSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DrawingAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call onMouseUp of the selectedTool when it receives a mouseUp event and drawing is active', () => {
        component['isDrawing'] = true;
        spyOn<any>(component, 'foregroundDataFromCanvas').and.returnValue({ original: 'original', modified: 'modified' });
        window.dispatchEvent(new MouseEvent('mouseup'));
        expect(selectedToolServiceSpy.selectedTool.onMouseUp).toHaveBeenCalled();
    });

    it('should call stop drawing when it receives a mouseUp event and drawing is active', () => {
        component['isDrawing'] = true;
        spyOn<any>(component, 'foregroundDataFromCanvas').and.returnValue({ original: 'original', modified: 'modified' });
        window.dispatchEvent(new MouseEvent('mouseup'));
        expect(component['isDrawing']).toBeFalsy();
    });

    it('should save the current state of the canvas when it receives a mouseUp event and drawing is active', () => {
        component['isDrawing'] = true;
        const canvasStateStub = { original: 'original', modified: 'modified' };
        const foregroundDataFromCanvasSpy = spyOn<any>(component, 'foregroundDataFromCanvas').and.returnValue(canvasStateStub);
        window.dispatchEvent(new MouseEvent('mouseup'));
        expect(foregroundDataFromCanvasSpy).toHaveBeenCalled();
        expect(foregroundDataServiceSpy.saveState).toHaveBeenCalledWith(canvasStateStub);
    });

    it(
        'should call onMouseMove of the selectedTool with the click coordinates and the canvas context ' +
            'when it receives a mouseMove event and drawing is active',
        () => {
            const fakeCoords = { x: 10, y: 15 };
            const fakeContext = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
            component['isDrawing'] = true;
            spyOn<any>(component, 'getMouseCoord').and.returnValue(fakeCoords);
            spyOn<any>(component, 'getCanvasContext').and.returnValue(fakeContext);
            window.dispatchEvent(new MouseEvent('mousemove'));
            expect(selectedToolServiceSpy.selectedTool.onMouseMove).toHaveBeenCalledWith(fakeCoords);
        },
    );

    it('should call onKeyDown of the selectedTool with the canvas context when it receives a KeyDown event and drawing is active', () => {
        const fakeContext = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        component['isDrawing'] = true;
        spyOn<any>(component, 'getCanvasContext').and.returnValue(fakeContext);
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
        expect(selectedToolServiceSpy.selectedTool.onKeyDown).toHaveBeenCalledWith('a');
    });

    it('should call onKeyUp of the selectedTool with the canvas context when it receives a KeyUp event and drawing is active', () => {
        const fakeContext = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        component['isDrawing'] = true;
        spyOn<any>(component, 'getCanvasContext').and.returnValue(fakeContext);
        window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }));
        expect(selectedToolServiceSpy.selectedTool.onKeyUp).toHaveBeenCalledWith('a');
    });

    it(
        'should call onMouseDown of the selectedTool with the foreground corresponding to the image index and the right coordinates ' +
            'when it receives a mouseDown event if drawing is active',
        () => {
            component['isDrawing'] = true;
            component['imageIndex'] = ImageIndex.Original;
            const fakeContext = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
            const clickCoord = { x: 10, y: 15 };
            const mouseEvent = new MouseEvent('mousedown', { clientX: clickCoord.x, clientY: clickCoord.y });
            component.onMouseDown(mouseEvent);
            expect(selectedToolServiceSpy.selectedTool.onMouseDown).toHaveBeenCalledWith(
                clickCoord,
                foregroundDataServiceSpy.foregroundData.original,
                fakeContext,
            );
            component['imageIndex'] = ImageIndex.Modified;
            component.onMouseDown(mouseEvent);
            expect(selectedToolServiceSpy.selectedTool.onMouseDown).toHaveBeenCalledWith(
                clickCoord,
                foregroundDataServiceSpy.foregroundData.modified,
                fakeContext,
            );
        },
    );

    it('updateForeground should call clearCanvas of draw service with the canvas size, the context and the new foreground data', () => {
        const newData = { original: 'TEST-ORIGINAL', modified: 'TEST-MODIFIED' };
        const fakeContext = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        spyOn<any>(component, 'getCanvasContext').and.returnValue(fakeContext);
        component.imageIndex = ImageIndex.Original;
        component['updateForeground'](newData);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(component['canvasSize'], fakeContext, newData.original);
        component.imageIndex = ImageIndex.Modified;
        component['updateForeground'](newData);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(component['canvasSize'], fakeContext, newData.modified);
    });

    it('getCanvas context should return the canvas context', () => {
        const ctxStub = CanvasTestHelper.createCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D;
        const nativeElementSpy = jasmine.createSpyObj('nativeElement', ['getContext']);
        nativeElementSpy.getContext.and.returnValue(ctxStub);
        component.canvas = {
            nativeElement: nativeElementSpy,
        };
        expect(component['getCanvasContext']()).toEqual(ctxStub);
        expect(nativeElementSpy.getContext).toHaveBeenCalled();
    });

    it('foregroundDataFromCanvas should return the data of the canvas of this area and the other area', () => {
        const dataUrlStub = 'test-dataUrl';
        const nativeElementSpy = jasmine.createSpyObj('nativeElement', ['toDataURL']);
        nativeElementSpy.toDataURL.and.returnValue(dataUrlStub);
        component.canvas = {
            nativeElement: nativeElementSpy,
        };
        component.imageIndex = ImageIndex.Original;
        expect(component['foregroundDataFromCanvas']()).toEqual({
            original: dataUrlStub,
            modified: foregroundDataServiceSpy.foregroundData.modified,
        });
        component.imageIndex = ImageIndex.Modified;
        expect(component['foregroundDataFromCanvas']()).toEqual({
            original: foregroundDataServiceSpy.foregroundData.original,
            modified: dataUrlStub,
        });
        expect(nativeElementSpy.toDataURL).toHaveBeenCalled();
    });

    it('should calculate the right mouse coordinates', () => {
        const mouseEvent = new MouseEvent('mousedown', { clientX: 300, clientY: 700 });
        component['offset'] = { x: 100, y: 50 };
        expect(component['getMouseCoord'](mouseEvent)).toEqual({ x: 200, y: 650 });
    });
});
