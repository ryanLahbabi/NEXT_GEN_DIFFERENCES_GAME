import { Coordinates } from '@common/interfaces/general/coordinates';
import { AbstractTool } from './abstract-tool';

export class Pencil extends AbstractTool {
    onMouseMove(coord: Coordinates): void {
        this.context.strokeStyle = AbstractTool.color;
        this.context.lineWidth = AbstractTool.size;
        this.context.lineCap = 'round';
        this.drawService.drawLine(this.previousCoord, coord, this.context);
        this.previousCoord = coord;
    }
}
