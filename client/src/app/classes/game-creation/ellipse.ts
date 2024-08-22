import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/images-constants';
import { Coordinates } from '@common/interfaces/general/coordinates';
import { AbstractTool } from './abstract-tool';

export class Ellipse extends AbstractTool {
    private circleActive: boolean = false;
    private firstCornerCoord: Coordinates;
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    onMouseDown(coord: Coordinates, initialForeground: string, context: CanvasRenderingContext2D): void {
        this.firstCornerCoord = coord;
        super.onMouseDown(coord, initialForeground, context);
    }

    onMouseUp(): void {
        this.circleActive = false;
    }

    onMouseMove(coord: Coordinates): void {
        this.makeEllipse(coord);
        this.previousCoord = coord;
    }

    onKeyDown(key: string): void {
        if (key === 'Shift') {
            this.circleActive = true;
            this.makeEllipse(this.previousCoord);
        }
    }

    onKeyUp(key: string): void {
        if (key === 'Shift') {
            this.circleActive = false;
            this.makeEllipse(this.previousCoord);
        }
    }

    private async makeEllipse(coord: Coordinates) {
        await this.drawService.clearCanvas(this.canvasSize, this.context, this.initialForeground);
        this.context.fillStyle = AbstractTool.color;
        this.drawService.fillEllipse(
            this.calculateCenter(this.firstCornerCoord, coord),
            this.calculateDimensions(this.firstCornerCoord, coord),
            this.context,
        );
    }

    private calculateCenter(start: Coordinates, end: Coordinates): Coordinates {
        const dimensions = this.calculateDimensions(start, end);
        return {
            x: start.x < end.x ? start.x + dimensions.x / 2 : start.x - dimensions.x / 2,
            y: start.y < end.y ? start.y + dimensions.y / 2 : start.y - dimensions.y / 2,
        };
    }

    private calculateDimensions(start: Coordinates, end: Coordinates): Coordinates {
        const width = Math.abs(end.x - start.x);
        const height = Math.abs(end.y - start.y);
        if (this.circleActive) {
            if (width < height) {
                return { x: width, y: width };
            } else {
                return { x: height, y: height };
            }
        } else {
            return { x: width, y: height };
        }
    }
}
