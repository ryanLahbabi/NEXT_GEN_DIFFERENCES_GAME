import { Sphere } from '@common/interfaces/general/sphere';

export default class SphereGenerator {
    static generate(radius: number): Sphere {
        radius = Math.floor(Math.abs(radius));
        const radiusAdjustment = 0.5;
        const adjustedRadius = radius + radiusAdjustment;
        const points: number[][] = [];
        const getWidth = (h: number) => Math.floor(Math.sqrt(adjustedRadius ** 2 - h ** 2));
        let lastWidth = getWidth(0);
        points.push([lastWidth + 1, lastWidth]);
        for (let height = 1; height <= adjustedRadius; height++) {
            const width = getWidth(height);
            points.push([lastWidth + 1, width]);
            lastWidth = width;
        }
        points.push([lastWidth + 1, 0]);
        return { points, radius };
    }
}
