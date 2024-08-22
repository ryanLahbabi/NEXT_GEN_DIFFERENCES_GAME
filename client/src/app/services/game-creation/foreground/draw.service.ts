import { Injectable } from '@angular/core';
import { NB_SPRAY_DOTS, SPRAY_DOT_SIZE } from '@app/constants/drawing-tools-constants';
import { ImageFileService } from '@app/services/divers/image-file.service';
import { Coordinates } from '@common/interfaces/general/coordinates';

@Injectable({
    providedIn: 'root',
})
export class DrawService {
    constructor(private imageFileService: ImageFileService) {}

    drawLine(start: Coordinates, end: Coordinates, context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.stroke();
    }

    drawDots(center: Coordinates, context: CanvasRenderingContext2D): void {
        const radius = context.lineWidth / 2;
        for (let i = 0; i < NB_SPRAY_DOTS; i++) {
            const r = radius * Math.sqrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const x = center.x + r * Math.cos(theta);
            const y = center.y + r * Math.sin(theta);
            context.fillRect(x, y, SPRAY_DOT_SIZE, SPRAY_DOT_SIZE);
        }
    }

    fillSquare(center: Coordinates, edgeSize: number, context: CanvasRenderingContext2D): void {
        context.fillRect(center.x - edgeSize / 2, center.y - edgeSize / 2, edgeSize, edgeSize);
    }

    fillRectangle(corner: Coordinates, dimensions: Coordinates, context: CanvasRenderingContext2D): void {
        context.fillRect(corner.x, corner.y, dimensions.x, dimensions.y);
    }

    fillEllipse(center: Coordinates, dimensions: Coordinates, context: CanvasRenderingContext2D): void {
        context.beginPath();
        context.ellipse(center.x, center.y, dimensions.x / 2, dimensions.y / 2, 0, 0, 2 * Math.PI);
        context.fill();
    }

    outlineRectangle(corner: Coordinates, dimensions: Coordinates, context: CanvasRenderingContext2D): void {
        context.strokeRect(corner.x, corner.y, dimensions.x, dimensions.y);
    }

    fillShape(corners: Coordinates[], context: CanvasRenderingContext2D): void {
        const firstCorner = corners.pop();
        if (firstCorner) {
            context.beginPath();
            context.moveTo(firstCorner.x, firstCorner.y);
            corners.forEach((corner) => {
                context.lineTo(corner.x, corner.y);
            });
            context.lineTo(firstCorner.x, firstCorner.y);
            context.fill();
        }
    }

    // eslint-disable-next-line max-params
    writeText(
        text: string,
        upperLeftCorner: Coordinates,
        context: CanvasRenderingContext2D,
        fontSize: number,
        textColor: string,
        backgroundColor?: string,
    ) {
        const padding = 5;
        context.font = `${fontSize}px sans-serif`;
        const width = context.measureText(text).width + padding * 2;
        const height = fontSize + padding * 2;
        if (backgroundColor) {
            context.fillStyle = backgroundColor;
            this.fillRectangle(upperLeftCorner, { x: width, y: height }, context);
        }
        context.fillStyle = textColor;
        context.fillText(text, upperLeftCorner.x + padding, upperLeftCorner.y + height - padding);
    }

    async clearCanvas(canvasDimensions: Coordinates, context: CanvasRenderingContext2D, initialForeground?: string): Promise<void> {
        if (initialForeground) {
            const foregroundImage = await this.imageFileService.loadImage(initialForeground);
            context.clearRect(0, 0, canvasDimensions.x, canvasDimensions.y);
            this.drawImage(foregroundImage, context);
        } else {
            context.clearRect(0, 0, canvasDimensions.x, canvasDimensions.y);
        }
    }

    drawImage(image: HTMLImageElement, context: CanvasRenderingContext2D, corner: Coordinates = { x: 0, y: 0 }): void {
        context.drawImage(image, corner.x, corner.y);
    }
}
