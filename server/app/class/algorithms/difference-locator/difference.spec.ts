import { Source } from '@common/enums/source';
import { FinalDifference } from '@common/interfaces/difference-locator-algorithm/final-difference';
import { FinalLinearSet } from '@common/interfaces/difference-locator-algorithm/final-linear-set';
import Difference from './difference';
import DifferenceLocator from './difference-locator';
import { HEIGHT, LONG_TEST_TIMEOUT, WIDTH } from './difference-locator.constants';

describe('DifferenceLocator', () => {
    let differenceLocator: DifferenceLocator;
    const originalImagePath = 'assets/tests/original1.bmp';
    const modifiedImagePath = 'assets/tests/modified1.bmp';

    it('should create an instance', () => {
        differenceLocator = new DifferenceLocator(originalImagePath, modifiedImagePath, Source.Path);
        expect(differenceLocator).toBeDefined();
    });
});

describe('Difference', () => {
    let differences;
    let difference: Difference;
    const validPaddingSet = {
        start: 0,
        end: 10,
        y: 0,
        keep: true,
        difference: undefined,
    };
    const invalidPaddingSet = {
        start: 3,
        end: 5,
        y: 0,
        keep: false,
        difference: undefined,
    };
    const pixelSet = {
        start: 0,
        end: 10,
        y: 0,
        colors: [0, 1],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        differences = [];
        difference = new Difference(0, 0, differences);
    });

    describe('getters and setters', () => {
        it(
            'should return the correct value for getLinearPaddingSets',
            () => {
                difference.addLinearPaddingSet(validPaddingSet);
                expect(difference.getLinearPaddingSets).toEqual([validPaddingSet]);
            },
            LONG_TEST_TIMEOUT,
        );

        it(
            'should return the correct value for getLinearPixelSets',
            () => {
                difference.addLinearPixelSet(pixelSet);
                expect(difference.getLinearPixelSets).toEqual([pixelSet]);
            },
            LONG_TEST_TIMEOUT,
        );

        it(
            'should return the correct value for getId',
            () => {
                expect(difference.getId).toEqual(0);
            },
            LONG_TEST_TIMEOUT,
        );

        it(
            'should return the correct value for getWeight',
            () => {
                const expectedWeight = 10;
                difference.addLinearPixelSet(pixelSet);
                expect(difference.getWeight).toEqual(expectedWeight);
            },
            LONG_TEST_TIMEOUT,
        );
    });

    it(
        'should stop the merge if there are no differences passed',
        () => {
            const largestDifference = Difference.optimizedMerge([], []);
            expect(largestDifference).toBeUndefined();
        },
        LONG_TEST_TIMEOUT,
    );

    it(
        'should return the largest difference',
        () => {
            const smallerDifference = new Difference(0, 0, differences);
            const largerDifference = new Difference(1, 0, differences);
            const differencesToCompare = [smallerDifference, largerDifference];
            largerDifference.addLinearPixelSet(pixelSet);
            expect(Difference.optimizedMerge(differencesToCompare, differences)).toEqual(largerDifference);
            expect(differences.length).toEqual(2);
        },
        LONG_TEST_TIMEOUT,
    );

    describe('addLinearPaddingSet', () => {
        it(
            'should add the given linearPaddingSet to the linearPaddingSets array',
            () => {
                difference.addLinearPaddingSet(validPaddingSet);
                expect(difference.getLinearPaddingSets).toContain(validPaddingSet);
            },
            LONG_TEST_TIMEOUT,
        );

        it(
            'should not increment the weight of the difference when the given linearPaddingSet has the "keep" property set to false',
            () => {
                difference.addLinearPaddingSet(invalidPaddingSet);
                expect(difference.getWeight).toEqual(0);
            },
            LONG_TEST_TIMEOUT,
        );

        it(
            'should refuse merging a difference to itself',
            () => {
                Difference.directionalMerge(difference, difference, differences);
                expect(differences.length).toEqual(1);
            },
            LONG_TEST_TIMEOUT,
        );
    });

    describe('getHint', () => {
        const leftLine: FinalLinearSet[][] = [[{ start: 1, end: 2 }]];
        const rightLine: FinalLinearSet[][] = [[{ start: WIDTH - 2, end: WIDTH - 1 }]];
        let finalDifference: FinalDifference;
        const getFinalDifference = (l: FinalLinearSet[][], y: number): FinalDifference => ({
            yMin: y,
            yMax: y,
            lines: l,
            hints: [],
        });

        beforeEach(() => {
            finalDifference = undefined;
        });

        it(
            'should return the top left section of the playing area',
            () => {
                finalDifference = getFinalDifference(leftLine, 0);
                Difference.generateHints(finalDifference, 1);
                expect(finalDifference.hints).toEqual([{ end: { x: 320, y: 240 }, start: { x: 0, y: 0 } }]);
            },
            LONG_TEST_TIMEOUT,
        );

        it(
            'should return the top right section of the playing area',
            () => {
                finalDifference = getFinalDifference(rightLine, 0);
                Difference.generateHints(finalDifference, 1);
                expect(finalDifference.hints).toEqual([{ end: { x: 640, y: 240 }, start: { x: 320, y: 0 } }]);
            },
            LONG_TEST_TIMEOUT,
        );

        it(
            'should return the bottom left section of the playing area',
            () => {
                finalDifference = getFinalDifference(leftLine, HEIGHT - 1);
                Difference.generateHints(finalDifference, 1);
                expect(finalDifference.hints).toEqual([{ end: { x: 320, y: 480 }, start: { x: 0, y: 240 } }]);
            },
            LONG_TEST_TIMEOUT,
        );

        it(
            'should return the bottom right section of the playing area',
            () => {
                finalDifference = getFinalDifference(rightLine, HEIGHT - 1);
                Difference.generateHints(finalDifference, 1);
                expect(finalDifference.hints).toEqual([{ end: { x: 640, y: 480 }, start: { x: 320, y: 240 } }]);
            },
            LONG_TEST_TIMEOUT,
        );
    });
});
