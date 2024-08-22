import { DrawService } from '@app/services/game-creation/foreground/draw.service';
import { Coordinates } from '@common/interfaces/general/coordinates';

export abstract class AbstractTool {
    static size: number;
    static color: string;
    static emissionsPerSecond: number;

    protected previousCoord: Coordinates;
    protected initialForeground: string;
    protected context: CanvasRenderingContext2D;

    constructor(protected drawService: DrawService) {}

    onMouseDown(coord: Coordinates, initialForeground: string, context: CanvasRenderingContext2D): void {
        this.previousCoord = coord;
        this.initialForeground = initialForeground;
        this.context = context;
        this.onMouseMove(coord);
    }

    onMouseUp?(): void;

    onKeyDown?(key: string): void;

    onKeyUp?(key: string): void;

    abstract onMouseMove(coord: Coordinates): void;
}
