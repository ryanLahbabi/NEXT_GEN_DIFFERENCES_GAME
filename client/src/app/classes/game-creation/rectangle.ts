import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/images-constants';
import { Coordinates } from '@common/interfaces/general/coordinates';
import { AbstractTool } from './abstract-tool';

export class Rectangle extends AbstractTool {
    private squareActive: boolean = false;
    private firstCornerCoord: Coordinates;
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    onMouseDown(coord: Coordinates, initialForeground: string, context: CanvasRenderingContext2D): void {
        this.firstCornerCoord = coord;
        super.onMouseDown(coord, initialForeground, context);
    }

    onMouseUp(): void {
        this.squareActive = false;
    }

    onMouseMove(coord: Coordinates): void {
        this.makeRectangle(coord);
        this.previousCoord = coord;
    }

    onKeyDown(key: string): void {
        if (key === 'Shift') {
            this.squareActive = true;
            this.makeRectangle(this.previousCoord);
        }
    }

    onKeyUp(key: string): void {
        if (key === 'Shift') {
            this.squareActive = false;
            this.makeRectangle(this.previousCoord);
        }
    }

    private async makeRectangle(coord: Coordinates) {
        await this.drawService.clearCanvas(this.canvasSize, this.context, this.initialForeground);
        this.context.fillStyle = AbstractTool.color;
        this.drawService.fillRectangle(this.firstCornerCoord, this.calculateDimensions(this.firstCornerCoord, coord), this.context);
    }

    private calculateDimensions(start: Coordinates, end: Coordinates): Coordinates {
        const width = end.x - start.x;
        const height = end.y - start.y;
        if (!this.squareActive) {
            return { x: width, y: height };
        } else {
            if (Math.abs(width) < Math.abs(height)) {
                return { x: width, y: this.changeModule(height, width) };
            } else {
                return { x: this.changeModule(width, height), y: height };
            }
        }
    }

    private changeModule(initialNumber: number, module: number): number {
        return (initialNumber / Math.abs(initialNumber)) * Math.abs(module);
    }
}
