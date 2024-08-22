import * as ExampleCard from '@app/../assets/tests/card/example-card.json';
import { FinalDifference } from '@common/interfaces/difference-locator-algorithm/final-difference';
import { BestTimes } from '@common/interfaces/game-card/best-times';
import { Card } from '@common/interfaces/game-card/card';
import { CardBase64Files } from '@common/interfaces/game-card/card-base64-files';
import { Coordinates } from '@common/interfaces/general/coordinates';
import * as fs from 'fs';
import DifferenceManager from './difference-manager';

class FakeDifferenceManager extends DifferenceManager {
    // set setUsedHints(value: number) {
    //     this.usedHints = value;
    // }

    set setFoundDifferenceAmount(value: number) {
        this.foundDifferenceNbr = value;
    }

    set setStartingDifferenceNbr(value: number) {
        this.card.differenceNbr = value;
    }

    set setCardId(value: string) {
        this.card.id = value;
    }

    setFoundDifferences(array: boolean[]) {
        this.foundDifferences = array;
    }

    isDifferenceFoundByIndex(index: number) {
        return this.foundDifferences[index];
    }
}

describe('Difference Manager', () => {
    let differenceManager: FakeDifferenceManager;
    let card: Card;
    const validClick: Coordinates = {
        x: ExampleCard.differences[0].lines[0][0].start,
        y: ExampleCard.differences[0].yMin,
    };
    const invalidClick: Coordinates = {
        x: ExampleCard.differences[0].lines[0][0].start,
        y: ExampleCard.differences[0].yMin - 1,
    };

    beforeEach(() => {
        const cardExample = JSON.parse(JSON.stringify(ExampleCard));
        card = {} as Card;
        card.name = cardExample.name;
        card.difficulty = cardExample.difficulty;
        card.classicSoloBestTimes = cardExample.classicSoloBestTimes as unknown as BestTimes;
        card.differences = cardExample.differences as unknown as FinalDifference[];
        card.differenceNbr = cardExample.differenceNbr;
        card.classic1v1BestTimes = cardExample.classic1v1BestTimes;

        const readDifferenceImage = (path: string) => fs.readFileSync(require.resolve('@app/../assets/tests/card/' + path), 'base64').toString();
        const cardFiles: CardBase64Files = {
            id: ExampleCard.id,
            originalImage: readDifferenceImage('original-image.bmp'),
            modifiedImage: readDifferenceImage('modified-image.bmp'),
            differencesBase64Files: Array.from({ length: card.differenceNbr }, (_, i) => ({
                differenceImage: readDifferenceImage('differenceOverlays/' + i + '.png'),
                flashImage: readDifferenceImage('differenceOverlays/flash_' + i + '.png'),
            })),
        };

        differenceManager = new FakeDifferenceManager(card, cardFiles, 0);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('originalDifferenceAmount', () => {
        it('should return the amount of total differences', () => {
            differenceManager.setStartingDifferenceNbr = 2;
            expect(differenceManager.originalDifferenceAmount).toEqual(2);
        });
    });

    describe('getFoundDifferences', () => {
        it('should return the amount of found differences', () => {
            differenceManager.setFoundDifferenceAmount = 2;
            expect(differenceManager.getFoundDifferenceNbr).toEqual(2);
        });
    });

    describe('cheatFlashImages', () => {
        it('should return the right flash images in a string array', () => {
            const foundDifferences = [false, true, false, true, true];
            const expectedResult = [
                fs.readFileSync(require.resolve('@app/../assets/tests/card/differenceOverlays/flash_0.png'), 'base64').toString(),
                undefined,
                fs.readFileSync(require.resolve('@app/../assets/tests/card/differenceOverlays/flash_2.png'), 'base64').toString(),
                undefined,
                undefined,
            ];
            differenceManager.setFoundDifferences(foundDifferences);
            const cheatFlashImages = differenceManager.cheatFlashImages;
            expect(cheatFlashImages).toEqual(expectedResult);
        });
    });

    // describe('hint', () => {
    //     const random = Math.random;
    //     const randomMock = jest.fn();

    //     beforeEach(() => {
    //         differenceManager.setFoundDifferences([false, true, false, true, true]);
    //         Math.random = randomMock;
    //     });

    //     afterAll(() => {
    //         Math.random = random;
    //     });

    //     it('should return the first hint', () => {
    //         differenceManager.setUsedHints = 0;
    //         randomMock.mockReturnValue(0);
    //         expect(differenceManager.hint).toEqual(ExampleCard.differences[0].hints[0]);
    //     });

    //     it('should return the second hint', () => {
    //         differenceManager.setUsedHints = 1;
    //         randomMock.mockReturnValue(1);
    //         expect(differenceManager.hint).toEqual(ExampleCard.differences[2].hints[1]);
    //     });

    //     it('should return the third hint', () => {
    //         differenceManager.setUsedHints = 2;
    //         randomMock.mockReturnValue(0);
    //         expect(differenceManager.hint).toEqual(ExampleCard.differences[0].hints[2]);
    //     });

    //     it('should return undefined if all the hints were used', () => {
    //         differenceManager.setUsedHints = 3;
    //         expect(differenceManager.hint).toBeUndefined();
    //     });

    //     it('should return undefined if there are no differences to be found', () => {
    //         differenceManager.setUsedHints = 0;
    //         differenceManager.setFoundDifferences([true, true, true, true, true]);
    //         expect(differenceManager.hint).toBeUndefined();
    //     });
    // });

    describe('foundAllDifferences', () => {
        it('should return true', () => {
            differenceManager.setFoundDifferenceAmount = ExampleCard.differenceNbr;
            expect(differenceManager.foundAllDifferences()).toBeTruthy();
        });

        it('should return false', () => {
            differenceManager.setFoundDifferenceAmount = ExampleCard.differenceNbr - 1;
            expect(differenceManager.foundAllDifferences()).toBeFalsy();
        });
    });

    describe('removeDifferenceByIndex', () => {
        it('should set the difference as found but not count it for the player', () => {
            differenceManager.setFoundDifferences([true, true, true, true, true]);
            differenceManager.removeDifferenceByIndex(0, false);
            expect(differenceManager.getFoundDifferenceNbr).toEqual(0);
            expect(differenceManager.isDifferenceFoundByIndex(0)).toBeTruthy();
        });

        it('should set the difference as found and count it for the player', () => {
            differenceManager.setFoundDifferences([true, true, true, true, true]);
            differenceManager.removeDifferenceByIndex(0, true);
            expect(differenceManager.getFoundDifferenceNbr).toEqual(1);
            expect(differenceManager.isDifferenceFoundByIndex(0)).toBeTruthy();
        });
    });

    describe('findDifference', () => {
        it('should find difference and return the image of the found difference as well as its flash', () => {
            const returnedValue = differenceManager.findDifference(validClick);
            expect(returnedValue).toEqual({
                differenceNaturalOverlay: fs.readFileSync(require.resolve('@app/../assets/tests/card/differenceOverlays/0.png'), 'base64').toString(),
                differenceFlashOverlay: fs
                    .readFileSync(require.resolve('@app/../assets/tests/card/differenceOverlays/flash_0.png'), 'base64')
                    .toString(),
                index: 0,
            });
        });

        it('should not find difference and return undefined', () => {
            const returnedValue = differenceManager.findDifference(invalidClick);
            expect(returnedValue).toBeUndefined();
        });
    });
});
