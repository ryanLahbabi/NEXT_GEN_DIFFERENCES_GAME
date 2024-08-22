import { BUCKET_FILL_TOLERANCE } from '@app/constants/drawing-tools-constants';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/images-constants';
import { Color } from '@app/interfaces/color';
import { Coordinates } from '@common/interfaces/general/coordinates';
import { AbstractTool } from './abstract-tool';

export class Bucket extends AbstractTool {
    private imageData: ImageData;

    onMouseMove(coord: Coordinates): void {
        this.previousCoord = coord;
    }

    onMouseDown(coord: Coordinates, initialForeground: string, context: CanvasRenderingContext2D): void {
        super.onMouseDown(coord, initialForeground, context);

        this.imageData = context.getImageData(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        const targetColor = this.getPixelColor(coord);
        const replacementColor = this.hexStringToColorObject(AbstractTool.color);

        if (!this.isSameColor(targetColor, replacementColor)) {
            let pixel;
            const toVisit = [coord];
            while ((pixel = toVisit.pop()) !== undefined) {
                const isEdge = !this.isSameColor(this.getPixelColor(pixel), targetColor);
                this.setPixelColor(pixel, replacementColor);
                if (!isEdge) {
                    if (pixel.x > 0) toVisit.push({ x: pixel.x - 1, y: pixel.y });
                    if (pixel.x < this.imageData.width - 1) toVisit.push({ x: pixel.x + 1, y: pixel.y });
                    if (pixel.y > 0) toVisit.push({ x: pixel.x, y: pixel.y - 1 });
                    if (pixel.y < this.imageData.height - 1) toVisit.push({ x: pixel.x, y: pixel.y + 1 });
                }
            }
        }

        this.context.putImageData(this.imageData, 0, 0);
    }

    private hexStringToColorObject(hex: string): Color {
        const redIndex = 1;
        const greenIndex = redIndex + 2;
        const blueIndex = greenIndex + 2;
        return {
            red: parseInt(hex.substring(redIndex, greenIndex), 16),
            green: parseInt(hex.substring(greenIndex, blueIndex), 16),
            blue: parseInt(hex.substring(blueIndex), 16),
            alpha: 255,
        };
    }

    private getPixelColor(pixelCoord: Coordinates): Color {
        const nbChannels = 4;
        return {
            red: this.imageData.data[pixelCoord.y * (this.imageData.width * nbChannels) + pixelCoord.x * nbChannels],
            green: this.imageData.data[pixelCoord.y * (this.imageData.width * nbChannels) + pixelCoord.x * nbChannels + 1],
            blue: this.imageData.data[pixelCoord.y * (this.imageData.width * nbChannels) + pixelCoord.x * nbChannels + 2],
            alpha: this.imageData.data[pixelCoord.y * (this.imageData.width * nbChannels) + pixelCoord.x * nbChannels + 3],
        };
    }

    private setPixelColor(pixelCoord: Coordinates, color: Color): void {
        const nbChannels = 4;
        this.imageData.data[pixelCoord.y * (this.imageData.width * nbChannels) + pixelCoord.x * nbChannels] = color.red;
        this.imageData.data[pixelCoord.y * (this.imageData.width * nbChannels) + pixelCoord.x * nbChannels + 1] = color.green;
        this.imageData.data[pixelCoord.y * (this.imageData.width * nbChannels) + pixelCoord.x * nbChannels + 2] = color.blue;
        this.imageData.data[pixelCoord.y * (this.imageData.width * nbChannels) + pixelCoord.x * nbChannels + 3] = color.alpha;
    }

    private isSameColor(color1: Color, color2: Color) {
        return (
            Math.sqrt(
                (color1.red - color2.red) ** 2 +
                    (color1.green - color2.green) ** 2 +
                    (color1.blue - color2.blue) ** 2 +
                    (color1.alpha - color2.alpha) ** 2,
            ) < BUCKET_FILL_TOLERANCE
        );
    }
}
