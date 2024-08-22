import { PaddingRadius } from '@common/enums/game-creation/padding-radius';
import { Difficulty } from '@common/enums/game-play/difficulty';
import { Source } from '@common/enums/source';
import { FinalDifference } from '@common/interfaces/difference-locator-algorithm/final-difference';
import { LinearPaddingSet } from '@common/interfaces/difference-locator-algorithm/linear-padding-set';
import { LinearPixelSet } from '@common/interfaces/difference-locator-algorithm/linear-pixel-set';
import { PaddingLine } from '@common/interfaces/difference-locator-algorithm/padding-line';
import Jimp from 'jimp';
import Difference from './difference';
import {
    DifferenceImageData,
    HARD_DIFFERENCE_NBR_INTERVAL,
    HEIGHT,
    MAX_DIFFERENCE_NBR,
    MIN_DIFFERENCE_NBR,
    OPAQUE,
    SphereValues,
    WIDTH,
} from './difference-locator.constants';

export default class DifferenceLocator {
    protected differences: Difference[] = [];
    protected sphereValues: number[][];
    protected img1: Jimp;
    protected img2: Jimp;
    protected historicLineNbr: number = 0;
    protected activeLines: PaddingLine[];
    protected followingLines: PaddingLine[];
    protected availableId = 0;
    protected radius: number;

    protected generateNewSet: boolean;
    protected collisionSet: LinearPaddingSet;

    constructor(private readonly image1Source: string, private readonly image2Source: string, private readonly source: Source) {}

    get getDifferenceNbr(): number {
        return this.differences.length;
    }

    get getRadius() {
        return this.radius;
    }

    get getSphereValues() {
        return this.sphereValues;
    }

    getDifficulty(): Difficulty {
        const diffNbr = this.getDifferenceNbr;
        if (diffNbr < MIN_DIFFERENCE_NBR || diffNbr > MAX_DIFFERENCE_NBR) return Difficulty.None;
        if (diffNbr >= HARD_DIFFERENCE_NBR_INTERVAL.start) return Difficulty.Hard;
        return Difficulty.Easy;
    }

    async getValidationData() {
        const BLACK = Jimp.rgbaToInt(0, 0, 0, OPAQUE);
        const image = new Jimp(WIDTH, HEIGHT, 'white');
        for (const diff of this.differences) {
            for (const set of diff.getLinearPaddingSets) {
                for (let x = set.start; x <= set.end; x++) image.setPixelColor(BLACK, x, set.y);
            }
        }
        return {
            valid: this.getDifficulty() !== Difficulty.None,
            differenceNbr: this.differences.length,
            difficulty: this.getDifficulty(),
            differenceImage: await image.getBase64Async(Jimp.MIME_PNG),
        };
    }

    getCreationData(): { finalDifferences: FinalDifference[]; differenceNbr: number; difficulty: Difficulty; imageData: DifferenceImageData } {
        const imageData: DifferenceImageData = {
            originalImage: this.img1,
            modifiedImage: this.img2,
            differencePixelSets: [],
        };
        for (const diff of this.differences) {
            imageData.differencePixelSets.push(diff.getLinearPixelSets);
        }
        const finalDifferences: FinalDifference[] = [];
        for (const diff of this.differences) finalDifferences.push(diff.finalizeDifference());
        return { finalDifferences, differenceNbr: finalDifferences.length, difficulty: this.getDifficulty(), imageData };
    }

    async findDifferences(radius: PaddingRadius): Promise<boolean> {
        this.radius = radius;
        this.differences = [];
        this.resetAlgorithmData();
        if (!this.setSphereValues() || !(await this.setImages())) return false;
        this.activeLines.push({ y: 0, paddingSets: [] });
        for (let i = 1; i < radius + 1; i++) this.followingLines.push({ y: i, paddingSets: [] });
        let done = false;
        while (!done) {
            done = this.historicLineNbr === HEIGHT;
            for (let x = 0; x < WIDTH; x++) {
                const pixelResults = this.comparePixels(x, this.historicLineNbr);
                if (pixelResults.isDifferent) {
                    const linearPixelSet = this.getLinearPixelSet(x, pixelResults.newColor);
                    const result = this.updateActiveLines(linearPixelSet);
                    result.addLinearPixelSet(linearPixelSet);
                    if (radius !== PaddingRadius.ZERO) this.updateFollowingLines(linearPixelSet, result);
                    x = linearPixelSet.end;
                }
            }
            if (this.activeLines.length === this.radius + 2) this.activeLines.shift();
            if (radius === PaddingRadius.ZERO) this.activeLines.push({ y: this.historicLineNbr, paddingSets: [] });
            else {
                this.activeLines.push(this.followingLines.shift());
                if (this.historicLineNbr + this.followingLines.length < HEIGHT)
                    this.followingLines.push({ y: this.historicLineNbr + this.radius + 1, paddingSets: [] });
            }
            this.historicLineNbr++;
        }
        return true;
    }

    protected resetAlgorithmData() {
        this.activeLines = [];
        this.followingLines = [];
        this.historicLineNbr = 0;
        this.availableId = 0;
        this.differences = [];
    }

    protected async setImages(): Promise<boolean> {
        try {
            switch (this.source) {
                case Source.Base64:
                    try {
                        this.img1 = await Jimp.read(Buffer.from(this.image1Source, 'base64'));
                        this.img2 = await Jimp.read(Buffer.from(this.image2Source, 'base64'));
                    } catch (e) {
                        this.img1 = await Jimp.read(Buffer.from(this.image1Source.replace('data:image/png;base64,', ''), 'base64'));
                        this.img2 = await Jimp.read(Buffer.from(this.image2Source.replace('data:image/png;base64,', ''), 'base64'));
                    }
                    break;
                case Source.Path:
                    this.img1 = await Jimp.read(this.image1Source);
                    this.img2 = await Jimp.read(this.image2Source);
                    break;
            }
        } catch (e) {
            this.img1 = undefined;
            this.img2 = undefined;
            return false;
        }
        const validDimensions = (image: Jimp): boolean => {
            return image.getHeight() === HEIGHT && image.getWidth() === WIDTH;
        };
        if (!validDimensions(this.img1) || !validDimensions(this.img2)) return false;
        return true;
    }

    protected setSphereValues(): boolean {
        switch (this.getRadius) {
            case PaddingRadius.ZERO:
                this.sphereValues = SphereValues.zero;
                break;
            case PaddingRadius.THREE:
                this.sphereValues = SphereValues.three;
                break;
            case PaddingRadius.NINE:
                this.sphereValues = SphereValues.nine;
                break;
            case PaddingRadius.FIFTEEN:
                this.sphereValues = SphereValues.fifteen;
                break;
            default:
                this.sphereValues = undefined;
                return false;
        }
        return true;
    }

    protected integrateActiveSet(paddingSet: LinearPaddingSet, previousLine: PaddingLine, presentRange: number) {
        if (!(this.collisionSet.start > paddingSet.end + 1) && !(this.collisionSet.end < paddingSet.start - 1)) {
            if (this.generateNewSet) {
                this.generateNewSet = false;
                if (this.collisionSet.start < paddingSet.start) paddingSet.start = this.collisionSet.start;
                if (this.collisionSet.end > paddingSet.end) paddingSet.end = this.collisionSet.end;
                this.collisionSet = paddingSet;
            } else {
                if (this.collisionSet.start > paddingSet.start) this.collisionSet.start = paddingSet.start;
                else if (this.collisionSet.end < paddingSet.end) this.collisionSet.end = paddingSet.end;
                paddingSet.keep = false;
                previousLine.paddingSets.splice(presentRange, 1);
            }
        }
    }

    protected updateActiveLines(linearPixelSet: LinearPixelSet): Difference {
        const attemptToMerge = this.radius === PaddingRadius.ZERO;
        let y = this.historicLineNbr;
        const differencesFound: Difference[] = [];
        const newSets: LinearPaddingSet[] = [];
        for (let index = this.activeLines.length - 1, i = 0; index >= 0; index--, i++, y--) {
            const previousLine = this.activeLines[index];
            this.generateNewSet = true;
            const relevantSphereValues = this.sphereValues[i];
            const minCollision = linearPixelSet.start - relevantSphereValues[0];
            const maxCollision = linearPixelSet.end + relevantSphereValues[0];
            this.collisionSet = {
                keep: true,
                difference: undefined,
                y,
                start: linearPixelSet.start - relevantSphereValues[1],
                end: linearPixelSet.end + relevantSphereValues[1],
            };
            for (let j = 0; j < previousLine.paddingSets.length; j++) {
                const paddingSet = previousLine.paddingSets[j];
                if (minCollision > paddingSet.end || maxCollision < paddingSet.start) continue;
                if (!differencesFound.includes(paddingSet.difference)) differencesFound.push(paddingSet.difference);
                if (attemptToMerge) continue;
                if (i === this.radius + 1) break;
                if (this.collisionSet.start >= paddingSet.start && this.collisionSet.end <= paddingSet.end) {
                    const difference = Difference.optimizedMerge(differencesFound, this.differences);
                    for (const newSet of newSets) difference.addLinearPaddingSet(newSet);
                    return difference;
                }
                this.integrateActiveSet(paddingSet, previousLine, j);
            }
            if (this.generateNewSet && i !== this.radius + 1) {
                newSets.push(this.collisionSet);
                previousLine.paddingSets.push(this.collisionSet);
            }
        }
        const finalDifference =
            differencesFound.length === 0
                ? new Difference(this.availableId++, newSets[newSets.length - 1].y, this.differences)
                : Difference.optimizedMerge(differencesFound, this.differences);
        for (const newSet of newSets) finalDifference.addLinearPaddingSet(newSet);
        return finalDifference;
    }

    protected integrateFollowingSet(paddingSet: LinearPaddingSet, followingLine: PaddingLine, presentRange: number) {
        if (this.generateNewSet) {
            this.generateNewSet = false;
            const updateStart = this.collisionSet.start < paddingSet.start;
            const updateEnd = this.collisionSet.end > paddingSet.end;
            if (updateStart) paddingSet.start = this.collisionSet.start;
            if (updateEnd) paddingSet.end = this.collisionSet.end;
            this.collisionSet = paddingSet;
        } else {
            if (this.collisionSet.start > paddingSet.start) this.collisionSet.start = paddingSet.start;
            else if (this.collisionSet.end < paddingSet.end) this.collisionSet.end = paddingSet.end;
            paddingSet.keep = false;
            followingLine.paddingSets.splice(presentRange, 1);
        }
    }

    protected updateFollowingLines(linearPixelSet: LinearPixelSet, difference: Difference) {
        let i = 1;
        for (const followingLine of this.followingLines) {
            this.generateNewSet = true;
            const relevantSphereValues = this.sphereValues[i];
            this.collisionSet = {
                keep: true,
                difference,
                y: this.historicLineNbr + i,
                start: linearPixelSet.start - relevantSphereValues[1],
                end: linearPixelSet.end + relevantSphereValues[1],
            };

            for (let j = 0; j < followingLine.paddingSets.length; j++) {
                const paddingSet = followingLine.paddingSets[j];
                if (this.collisionSet.start > paddingSet.end + 1 || this.collisionSet.end < paddingSet.start - 1) continue;
                this.integrateFollowingSet(paddingSet, followingLine, j);
            }
            if (this.generateNewSet) {
                followingLine.paddingSets.push(this.collisionSet);
                difference.addLinearPaddingSet(this.collisionSet);
            }
            i++;
        }
    }

    protected getLinearPixelSet(start: number, color: number): LinearPixelSet {
        const y = this.historicLineNbr;
        const linearPixelSet: LinearPixelSet = { colors: [color], y, start, end: start };
        for (let x = start + 1; ; x++) {
            const pixelResults = this.comparePixels(x, y);
            if (x >= WIDTH || !pixelResults.isDifferent) {
                linearPixelSet.end = x - 1;
                break;
            } else linearPixelSet.colors.push(pixelResults.newColor);
        }
        return linearPixelSet;
    }

    protected comparePixels(x: number, y: number): { isDifferent: boolean; newColor?: number } {
        const pixelColor1 = this.img1.getPixelColor(x, y);
        const pixelColor2 = this.img2.getPixelColor(x, y);
        if (pixelColor1 !== pixelColor2) return { isDifferent: true, newColor: pixelColor1 };
        return { isDifferent: false };
    }
}
