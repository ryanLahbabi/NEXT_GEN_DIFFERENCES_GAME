import { NB_MS_IN_SECOND } from '@app/constants/time-constants';
import { Coordinates } from '@common/interfaces/general/coordinates';
import { AbstractTool } from './abstract-tool';

export class Airbrush extends AbstractTool {
    protected isPressing = false;

    onMouseDown(coord: Coordinates, initialForeground: string, context: CanvasRenderingContext2D): void {
        super.onMouseDown(coord, initialForeground, context);
        this.isPressing = true;
        this.continuouslySpray();
    }

    onMouseMove(coord: Coordinates): void {
        this.previousCoord = coord;
    }

    onMouseUp(): void {
        this.isPressing = false;
    }

    private async continuouslySpray(): Promise<void> {
        this.context.fillStyle = AbstractTool.color;
        this.context.lineWidth = AbstractTool.size;
        this.context.lineCap = 'round';
        while (this.isPressing) {
            this.drawService.drawDots(this.previousCoord, this.context);
            await new Promise((resolve) => setTimeout(resolve, NB_MS_IN_SECOND / AbstractTool.emissionsPerSecond));
        }
    }
}
