import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/images-constants';
import { DrawService } from '@app/services/game-creation/foreground/draw.service';
import { ForegroundDataService } from '@app/services/game-creation/foreground/foreground-data.service';
import { SelectedToolService } from '@app/services/game-creation/foreground/selected-tool.service';
import { ImageIndex } from '@common/enums/game-creation/image-index';
import { ForegroundState } from '@common/interfaces/game-creation/foreground-state';
import { Coordinates } from '@common/interfaces/general/coordinates';

@Component({
    selector: 'app-drawing-area',
    templateUrl: './drawing-area.component.html',
    styleUrls: ['./drawing-area.component.scss'],
})
export class DrawingAreaComponent implements OnInit {
    @Input() imageIndex: ImageIndex;
    @ViewChild('canvas') canvas: ElementRef;

    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    private isDrawing: boolean = false;
    private offset: Coordinates;
    private pendingKeyPressedEvent?: KeyboardEvent = undefined;

    constructor(
        private selectedToolService: SelectedToolService,
        private foregroundDataService: ForegroundDataService,
        private drawService: DrawService,
    ) {}

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(): void {
        if (this.isDrawing) {
            this.isDrawing = false;
            if (this.selectedToolService.selectedTool.onMouseUp) this.selectedToolService.selectedTool.onMouseUp();
            this.foregroundDataService.saveState(this.foregroundDataFromCanvas());
        }
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(e: MouseEvent): void {
        if (this.isDrawing) {
            this.selectedToolService.selectedTool.onMouseMove(this.getMouseCoord(e));
        }
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(e: KeyboardEvent): void {
        this.pendingKeyPressedEvent = e;
        if (this.isDrawing) {
            if (this.selectedToolService.selectedTool.onKeyDown) this.selectedToolService.selectedTool.onKeyDown(e.key);
        }
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(e: KeyboardEvent): void {
        this.pendingKeyPressedEvent = undefined;
        if (this.isDrawing) {
            if (this.selectedToolService.selectedTool.onKeyUp) this.selectedToolService.selectedTool.onKeyUp(e.key);
        }
    }

    onMouseDown(e: MouseEvent): void {
        this.isDrawing = true;
        this.offset = { x: e.clientX - e.offsetX, y: e.clientY - e.offsetY };
        const currentForegroundData = this.foregroundDataService.foregroundData;
        this.selectedToolService.selectedTool.onMouseDown(
            { x: e.offsetX, y: e.offsetY },
            this.imageIndex === ImageIndex.Original ? currentForegroundData.original : currentForegroundData.modified,
            this.getCanvasContext(),
        );
        if (this.pendingKeyPressedEvent) {
            if (this.selectedToolService.selectedTool.onKeyDown) {
                this.selectedToolService.selectedTool.onKeyDown(this.pendingKeyPressedEvent.key);
            }
        }
    }

    ngOnInit(): void {
        this.foregroundDataService.stateChangeEvent.subscribe(this.updateForeground.bind(this));
    }

    private updateForeground(newForeground: ForegroundState): void {
        const newData = this.imageIndex === ImageIndex.Original ? newForeground.original : newForeground.modified;
        this.drawService.clearCanvas(this.canvasSize, this.getCanvasContext(), newData);
    }

    private getCanvasContext(): CanvasRenderingContext2D {
        return this.canvas.nativeElement.getContext('2d', { willReadFrequently: true });
    }

    private foregroundDataFromCanvas(): ForegroundState {
        const currentData = this.foregroundDataService.foregroundData;
        const canvasData = this.canvas.nativeElement.toDataURL();
        if (this.imageIndex === ImageIndex.Original) {
            return { original: canvasData, modified: currentData.modified };
        } else {
            return { original: currentData.original, modified: canvasData };
        }
    }

    private getMouseCoord(e: MouseEvent): Coordinates {
        return { x: e.clientX - this.offset.x, y: e.clientY - this.offset.y };
    }
}
