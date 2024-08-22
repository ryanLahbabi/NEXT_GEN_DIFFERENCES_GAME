import { FinalDifference } from '@common/interfaces/difference-locator-algorithm/final-difference';
import { LinearPaddingSet } from '@common/interfaces/difference-locator-algorithm/linear-padding-set';
import { LinearPixelSet } from '@common/interfaces/difference-locator-algorithm/linear-pixel-set';
import { Coordinates } from '@common/interfaces/general/coordinates';
import { HEIGHT, WIDTH } from './difference-locator.constants';

export default class Difference {
    private linearPaddingSets: LinearPaddingSet[] = [];
    private linearPixelSets: LinearPixelSet[] = [];
    private weight: number = 0;

    constructor(private readonly id: number, private yMin: number, differences: Difference[]) {
        differences.push(this);
    }

    get getLinearPaddingSets() {
        return this.linearPaddingSets;
    }

    get getLinearPixelSets() {
        return this.linearPixelSets;
    }

    get getId() {
        return this.id;
    }

    get getWeight() {
        return this.weight;
    }

    static optimizedMerge(differences: Difference[], allDifferences: Difference[]) {
        if (differences.length === 0) return;
        let largestDifference = differences[0];
        if (differences.length > 1) {
            let largestDifferenceIndex = 0;
            let largestDifferenceWeight = largestDifference.weight;
            for (let i = 1; i < differences.length; i++) {
                const weight = differences[i].weight;
                if (weight > largestDifferenceWeight) {
                    largestDifferenceIndex = i;
                    largestDifferenceWeight = weight;
                }
            }
            largestDifference = differences.splice(largestDifferenceIndex, 1)[0];
            for (const difference of differences) this.directionalMerge(difference, largestDifference, allDifferences);
        }
        return largestDifference;
    }

    static directionalMerge(from: Difference, to: Difference, allDifferences: Difference[]) {
        if (from.id === to.id) return;
        for (const linearPaddingSet of from.linearPaddingSets) to.addLinearPaddingSet(linearPaddingSet);
        for (const linearPixelSet of from.linearPixelSets) to.addLinearPixelSet(linearPixelSet);
        to.yMin = Math.min(to.yMin, from.yMin);
        allDifferences.forEach((value, key) => {
            if (value.id === from.id) {
                allDifferences.splice(key, 1);
                return;
            }
        });
        from.linearPaddingSets = [];
        from.linearPixelSets = [];
    }

    static generateHints(difference: FinalDifference, range: number) {
        const start: Coordinates = { x: 0, y: 0 };
        const end: Coordinates = { x: WIDTH, y: HEIGHT };
        while (range--) {
            const matrix = [0, 0, 0, 0];
            const middle: Coordinates = {
                x: (end.x + start.x) / 2,
                y: (end.y + start.y) / 2,
            };
            let y = difference.yMin;
            for (const line of difference.lines) {
                for (const set of line) {
                    let left = 0;
                    let right = 0;
                    const total = set.end - set.start;
                    if (set.end < middle.x) left = total;
                    else if (set.start > middle.x) right = total;
                    else {
                        right = set.end - middle.x;
                        left = total - right;
                    }
                    let selectedIndex: number;
                    if (y <= middle.y) selectedIndex = 0;
                    else selectedIndex = 2;
                    matrix[selectedIndex] += left;
                    matrix[selectedIndex + 1] += right;
                }
                y++;
            }
            let maxIndex = 0;
            for (let i = 0; i < matrix.length; i++) if (matrix[i] > matrix[maxIndex]) maxIndex = i;
            switch (maxIndex) {
                case 0:
                    end.x = middle.x;
                    end.y = middle.y;
                    break;
                case 1:
                    start.x = middle.x;
                    end.y = middle.y;
                    break;
                case 2:
                    end.x = middle.x;
                    start.y = middle.y;
                    break;
                case 3:
                    start.x = middle.x;
                    start.y = middle.y;
                    break;
            }
            difference.hints.push(JSON.parse(JSON.stringify({ start, end })));
        }
    }

    addLinearPaddingSet(linearPaddingSet: LinearPaddingSet) {
        if (linearPaddingSet.keep) {
            linearPaddingSet.difference = this;
            this.linearPaddingSets.push(linearPaddingSet);
        }
    }

    addLinearPixelSet(linearPixelSet: LinearPixelSet) {
        this.linearPixelSets.push(linearPixelSet);
        this.weight += linearPixelSet.end - linearPixelSet.start;
    }

    finalizeDifference(): FinalDifference {
        let yMax = this.yMin - 1;

        const finalDifference: FinalDifference = {
            yMin: this.yMin,
            yMax,
            lines: [],
            hints: [],
        };
        let xMin = WIDTH;
        let xMax = 0;
        for (const set of this.linearPaddingSets) {
            if (set.keep) {
                if (set.y > yMax) {
                    for (let i = 0; i < set.y - yMax; i++) finalDifference.lines.push([]);
                    yMax = set.y;
                }
                if (set.start < xMin) xMin = set.start;
                if (set.end > xMax) xMax = set.end;
                const line = finalDifference.lines[set.y - this.yMin];
                line.push(set);
            }
        }
        finalDifference.yMax = yMax;
        Difference.generateHints(finalDifference, 2);
        finalDifference.hints.push({ start: { x: xMin, y: finalDifference.yMin }, end: { x: xMax, y: finalDifference.yMax } });
        return finalDifference;
    }
}
