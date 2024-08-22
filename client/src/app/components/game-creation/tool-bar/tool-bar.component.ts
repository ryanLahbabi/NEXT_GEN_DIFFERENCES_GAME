import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AbstractTool } from '@app/classes/game-creation/abstract-tool';
import { Airbrush } from '@app/classes/game-creation/airbrush';
import { Bucket } from '@app/classes/game-creation/bucket';
import { Ellipse } from '@app/classes/game-creation/ellipse';
import { Eraser } from '@app/classes/game-creation/eraser';
import { Pencil } from '@app/classes/game-creation/pencil';
import { Rectangle } from '@app/classes/game-creation/rectangle';
import { DEFAULT_SPRAY_FLOW, SPRAY_PER_SECOND, TOOL_DEFAULT_SIZE, TOOL_MAX_SIZE, TOOL_MIN_SIZE } from '@app/constants/drawing-tools-constants';
import { DrawService } from '@app/services/game-creation/foreground/draw.service';
import { ForegroundDataService } from '@app/services/game-creation/foreground/foreground-data.service';
import { SelectedToolService } from '@app/services/game-creation/foreground/selected-tool.service';
import { ImageIndex } from '@common/enums/game-creation/image-index';

@Component({
    selector: 'app-tool-bar',
    templateUrl: './tool-bar.component.html',
    styleUrls: ['./tool-bar.component.scss'],
})
export class ToolBarComponent implements OnInit {
    @ViewChild('sizeInput') sizeInput: ElementRef;

    toolSize: number;
    airbrushFlow: number;
    pencil = new Pencil(this.drawService);
    rectangle = new Rectangle(this.drawService);
    eraser = new Eraser(this.drawService);
    ellipse = new Ellipse(this.drawService);
    airbrush = new Airbrush(this.drawService);
    bucket = new Bucket(this.drawService);

    constructor(
        private selectedToolService: SelectedToolService,
        private drawService: DrawService,
        private foregroundDataService: ForegroundDataService,
    ) {}

    get selectedTool(): AbstractTool {
        return this.selectedToolService.selectedTool;
    }

    get undoIsPossible(): boolean {
        return this.foregroundDataService.undoIsPossible;
    }

    get redoIsPossible(): boolean {
        return this.foregroundDataService.redoIsPossible;
    }

    get bothImagesIndex() {
        return ImageIndex.Both;
    }

    get minSize(): number {
        return TOOL_MIN_SIZE;
    }

    get maxSize(): number {
        return TOOL_MAX_SIZE;
    }

    get defaultFlowIndex(): number {
        return DEFAULT_SPRAY_FLOW;
    }

    get flowValues(): number[] {
        return SPRAY_PER_SECOND;
    }

    get disableSize(): boolean {
        return this.selectedTool === this.rectangle || this.selectedTool === this.ellipse || this.selectedTool === this.bucket;
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(e: KeyboardEvent): void {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            if (e.shiftKey) {
                this.redo();
            } else {
                this.undo();
            }
        }
    }

    ngOnInit() {
        this.selectTool(this.pencil);
        this.toolSize = TOOL_DEFAULT_SIZE;
        this.setLineSize();
        this.setColor('#000000');
        this.setSprayFlow(DEFAULT_SPRAY_FLOW.toString());
    }

    setLineSize(): void {
        this.validateSizeInput();
        AbstractTool.size = this.toolSize;
    }

    setColor(color: string): void {
        AbstractTool.color = color;
    }

    selectTool(tool: AbstractTool): void {
        this.selectedToolService.selectedTool = tool;
    }

    undo(): void {
        this.foregroundDataService.undo();
    }

    redo(): void {
        this.foregroundDataService.redo();
    }

    setSprayFlow(value: string) {
        this.airbrushFlow = this.flowValues[parseInt(value, 10)];
        AbstractTool.emissionsPerSecond = this.airbrushFlow;
    }

    private validateSizeInput() {
        if (this.toolSize < TOOL_MIN_SIZE) {
            this.sizeInput.nativeElement.value = TOOL_MIN_SIZE;
            this.toolSize = TOOL_MIN_SIZE;
        } else if (this.toolSize > TOOL_MAX_SIZE) {
            this.sizeInput.nativeElement.value = TOOL_MAX_SIZE;
            this.toolSize = TOOL_MAX_SIZE;
        }
    }
}
