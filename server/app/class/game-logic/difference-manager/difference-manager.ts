import { Hint } from '@common/interfaces/difference-locator-algorithm/hint';
import { Card } from '@common/interfaces/game-card/card';
import { CardBase64Files } from '@common/interfaces/game-card/card-base64-files';
import { GameDifferenceImages } from '@common/interfaces/game-play/game-click.dto';
import { Coordinates } from '@common/interfaces/general/coordinates';

export default class DifferenceManager {
    protected foundDifferences: boolean[] = [];
    protected foundDifferenceNbr: number = 0;
    protected usedHints: number;

    constructor(protected readonly card: Card, protected readonly cardFiles: CardBase64Files, usedHints: number = 0) {
        this.usedHints = usedHints;
        for (let i = 0; i < this.card.differenceNbr; i++) {
            this.foundDifferences.push(false);
        }
    }

    get getUsedHintNbr() {
        return this.usedHints;
    }

    get originalDifferenceAmount() {
        return this.card.differenceNbr;
    }

    get getFoundDifferenceNbr() {
        return this.foundDifferenceNbr;
    }

    get cheatFlashImages() {
        const flashImages: string[] = [];
        for (let i = 0; i < this.foundDifferences.length; i++)
            if (!this.foundDifferences[i]) flashImages.push(this.cardFiles.differencesBase64Files[i].flashImage);
            else flashImages.push(undefined);
        return flashImages;
    }

    get hint(): Hint {
        const filter = 0.999;
        if (this.usedHints > 2) return undefined;
        const differenceToFindIndexes = [];
        for (let i = 0; i < this.foundDifferences.length; i++) if (!this.foundDifferences[i]) differenceToFindIndexes.push(i);
        if (differenceToFindIndexes.length === 0) return undefined;
        const randomDifference = this.card.differences[differenceToFindIndexes[Math.floor(Math.random() * differenceToFindIndexes.length * filter)]];
        return randomDifference.hints[this.usedHints++];
    }

    foundAllDifferences(): boolean {
        return this.foundDifferenceNbr === this.card.differenceNbr;
    }

    removeDifferenceByIndex(index: number, isFound: boolean) {
        this.foundDifferences[index] = true;
        if (isFound) this.foundDifferenceNbr++;
    }

    findDifference(clickCoordinates: Coordinates): GameDifferenceImages | undefined {
        const x = clickCoordinates.x;
        const y = clickCoordinates.y;
        for (let i = 0; i < this.card.differences.length; i++) {
            const difference = this.card.differences[i];
            if (!this.foundDifferences[i] && y >= difference.yMin && y <= difference.yMax) {
                const sets = difference.lines[y - difference.yMin];
                for (const set of sets)
                    if (x >= set.start && x <= set.end) {
                        this.foundDifferences[i] = true;
                        this.foundDifferenceNbr++;
                        return {
                            differenceNaturalOverlay: this.cardFiles.differencesBase64Files[i].differenceImage,
                            differenceFlashOverlay: this.cardFiles.differencesBase64Files[i].flashImage,
                            index: i,
                        };
                    }
            }
        }
        return undefined;
    }
}
