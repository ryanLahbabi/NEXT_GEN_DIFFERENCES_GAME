import { PaddingRadius } from '@common/enums/game-creation/padding-radius';
import { Difficulty } from '@common/enums/game-play/difficulty';
import { Source } from '@common/enums/source';
import * as fs from 'fs';
import Difference from './difference';
import DifferenceLocator from './difference-locator';
import { LONG_TEST_TIMEOUT, SphereValues } from './difference-locator.constants';

interface Image {
    originalImagePath: string;
    modifiedImagePath: string;
    object: FakeDifferenceLocator;
    valid: boolean;
    differenceNbr: number;
    difficulty: Difficulty;
}

class FakeDifferenceLocator extends DifferenceLocator {
    get getDifferences() {
        return this.differences;
    }

    get getActiveLines() {
        return this.activeLines;
    }

    get getFollowingLines() {
        return this.followingLines;
    }

    get getHistoricLineNbr() {
        return this.historicLineNbr;
    }

    get getAvailableId() {
        return this.availableId;
    }

    get image1() {
        return this.img1;
    }

    get image2() {
        return this.img2;
    }

    set setDifferences(value: Difference[]) {
        this.differences = value;
    }

    setSphereValues(): boolean {
        return super.setSphereValues();
    }

    comparePixels(x: number, y: number): { isDifferent: boolean; newColor?: number } {
        return super.comparePixels(x, y);
    }

    resetAlgorithmData() {
        super.resetAlgorithmData();
    }

    async setImages(): Promise<boolean> {
        return super.setImages();
    }
}

describe('DifferenceLocator', () => {
    let differenceLocator: DifferenceLocator;
    let allImages = [];

    const images: { elevenDifferences: Image; eightDifferences: Image; fourDifferences: Image; oneDifference: Image } = {
        elevenDifferences: {
            originalImagePath: './assets/tests/eleven-differences-original.bmp',
            modifiedImagePath: './assets/tests/eleven-differences-modified.bmp',
            object: undefined,
            valid: false,
            differenceNbr: 11,
            difficulty: Difficulty.None,
        },
        eightDifferences: {
            originalImagePath: './assets/tests/eight-differences-original.bmp',
            modifiedImagePath: './assets/tests/eight-differences-modified.bmp',
            differenceNbr: 8,
            object: undefined,
            valid: true,
            difficulty: Difficulty.Hard,
        },
        fourDifferences: {
            originalImagePath: './assets/tests/four-differences-original.bmp',
            modifiedImagePath: './assets/tests/four-differences-modified.bmp',
            differenceNbr: 4,
            object: undefined,
            valid: true,
            difficulty: Difficulty.Easy,
        },
        oneDifference: {
            originalImagePath: './assets/tests/one-differences-original.bmp',
            modifiedImagePath: './assets/tests/one-differences-modified.bmp',
            differenceNbr: 1,
            object: undefined,
            valid: false,
            difficulty: Difficulty.None,
        },
    };

    beforeEach(async () => {
        images.oneDifference.object = new FakeDifferenceLocator(
            images.oneDifference.originalImagePath,
            images.oneDifference.modifiedImagePath,
            Source.Path,
        );
        images.fourDifferences.object = new FakeDifferenceLocator(
            images.fourDifferences.originalImagePath,
            images.fourDifferences.modifiedImagePath,
            Source.Path,
        );
        images.eightDifferences.object = new FakeDifferenceLocator(
            images.eightDifferences.originalImagePath,
            images.eightDifferences.modifiedImagePath,
            Source.Path,
        );
        images.elevenDifferences.object = new FakeDifferenceLocator(
            images.elevenDifferences.originalImagePath,
            images.elevenDifferences.modifiedImagePath,
            Source.Path,
        );
        allImages = [images.oneDifference, images.fourDifferences, images.eightDifferences, images.elevenDifferences];
        differenceLocator = undefined;
    }, LONG_TEST_TIMEOUT);

    it('should be defined', () => {
        expect(images.oneDifference.object).toBeDefined();
        expect(images.fourDifferences.object).toBeDefined();
        expect(images.eightDifferences.object).toBeDefined();
        expect(images.elevenDifferences.object).toBeDefined();
    });

    it(
        'should return the right difficulty according to the number of differences',
        () => {
            for (const image of allImages) {
                jest.spyOn(image.object, 'getDifferenceNbr', 'get').mockReturnValue(image.differenceNbr);
                expect(image.object.getDifficulty()).toEqual(image.difficulty);
            }
        },
        LONG_TEST_TIMEOUT,
    );

    it(
        'should recognize identical and different pixel colors',
        async () => {
            await images.fourDifferences.object.setImages();
            expect(images.fourDifferences.object.comparePixels(0, 0)).toEqual({ isDifferent: false });
            const coord = 48;
            expect(images.fourDifferences.object.comparePixels(coord, coord)).toEqual({ isDifferent: true, newColor: 4294967295 });
        },
        LONG_TEST_TIMEOUT,
    );

    it(
        'should return the right sphereValue',
        () => {
            const wrongRadius = -1;
            const radiuses = [PaddingRadius.ZERO, PaddingRadius.THREE, PaddingRadius.NINE, PaddingRadius.FIFTEEN, wrongRadius];
            const expectedSphereValues = [SphereValues.zero, SphereValues.three, SphereValues.nine, SphereValues.fifteen, undefined];
            for (let i = 0; i < radiuses.length; i++) {
                jest.spyOn(images.fourDifferences.object, 'getRadius', 'get').mockReturnValue(radiuses[i]);
                images.fourDifferences.object.setSphereValues();
                expect(images.fourDifferences.object.getSphereValues).toEqual(expectedSphereValues[i]);
            }
        },
        LONG_TEST_TIMEOUT,
    );

    // it(
    //     'should send valid validationData',
    //     async () => {
    //         const difference = new Difference(1, 0, []);
    //         difference.addLinearPaddingSet({
    //             keep: true,
    //             y: 0,
    //             start: 0,
    //             end: 0,
    //             difference,
    //         });
    //         const returnedData = new Jimp(WIDTH, HEIGHT, 'white');
    //         const BLACK = { r: 0, g: 0, b: 0, a: 255 };
    //         returnedData.setPixelColor(Jimp.rgbaToInt(BLACK.r, BLACK.g, BLACK.b, BLACK.a), 0, 0);
    //         images.fourDifferences.object.setDifferences = [difference];
    //         const data = await images.fourDifferences.object.getValidationData();
    //         expect(data).toEqual({
    //             valid: false,
    //             differenceNbr: 1,
    //             difficulty: Difficulty.None,
    //             differenceImage: await returnedData.getBase64Async(Jimp.MIME_PNG),
    //         });
    //     },
    //     LONG_TEST_TIMEOUT,
    // );

    it(
        'should interpret the data depending on the source type passed',
        async () => {
            const validPaths = new FakeDifferenceLocator(
                images.fourDifferences.originalImagePath,
                images.fourDifferences.modifiedImagePath,
                Source.Path,
            );
            const validStringBuffers = new FakeDifferenceLocator(
                fs.readFileSync(images.fourDifferences.originalImagePath, 'base64').toString(),
                fs.readFileSync(images.fourDifferences.modifiedImagePath, 'base64').toString(),
                Source.Base64,
            );
            const invalidPaths = new FakeDifferenceLocator(
                fs.readFileSync(images.fourDifferences.originalImagePath, 'base64').toString(),
                images.fourDifferences.modifiedImagePath,
                Source.Path,
            );
            const invalidBufferStrings = new FakeDifferenceLocator(
                fs.readFileSync(images.fourDifferences.originalImagePath, 'base64').toString(),
                images.fourDifferences.modifiedImagePath,
                Source.Base64,
            );
            const differenceLocators = [validPaths, validStringBuffers, invalidPaths, invalidBufferStrings];
            const expectedResults = [true, true, false, false];

            for (let i = 0; i < differenceLocators.length; i++) {
                const expectedResult = expectedResults[i];
                expect(await differenceLocators[i].setImages()).toEqual(expectedResult);
                expect(differenceLocators[i].image1 !== undefined).toEqual(expectedResult);
                expect(differenceLocators[i].image2 !== undefined).toEqual(expectedResult);
            }
        },
        LONG_TEST_TIMEOUT,
    );

    it(
        'should return false if the image data is wrong',
        async () => {
            const wrongDimensionsImagePath = './assets/tests/wrong-dimensions.png';
            differenceLocator = new DifferenceLocator(wrongDimensionsImagePath, images.fourDifferences.modifiedImagePath, Source.Path);
            expect(await differenceLocator.findDifferences(PaddingRadius.THREE)).toEqual(false);
        },
        LONG_TEST_TIMEOUT,
    );

    // it(
    //     'should return true if there are between 3 and 9 differences and false if not',
    //     async () => {
    //         for (const image of allImages) {
    //             await image.object.findDifferences(PaddingRadius.ZERO);
    //             expect(image.object.getDifficulty() !== Difficulty.None).toEqual(image.valid);
    //         }
    //     },
    //     LONG_TEST_TIMEOUT,
    // );

    it(
        'should return empty values if findDifferences has not been called or has refused the difference set',
        async () => {
            const creationData = images.fourDifferences.object.getCreationData();
            expect(creationData.finalDifferences.length).toEqual(0);
            expect(creationData.differenceNbr).toEqual(0);
            expect(creationData.difficulty).toEqual(Difficulty.None);
            const imageData = creationData.imageData;
            expect(imageData.originalImage).toBeUndefined();
            expect(imageData.modifiedImage).toBeUndefined();
            expect(imageData.differencePixelSets.length).toEqual(0);
        },
        LONG_TEST_TIMEOUT,
    );

    it(
        'should return defined values if findDifferences has been called',
        async () => {
            await images.fourDifferences.object.findDifferences(PaddingRadius.THREE);
            const creationData = images.fourDifferences.object.getCreationData();
            expect(creationData.finalDifferences.length).toEqual(images.fourDifferences.differenceNbr);
            expect(creationData.differenceNbr).toEqual(images.fourDifferences.differenceNbr);
            expect(creationData.difficulty).toEqual(images.fourDifferences.difficulty);
            const imageData = creationData.imageData;
            expect(imageData.originalImage).toBeDefined();
            expect(imageData.modifiedImage).toBeDefined();
            expect(imageData.differencePixelSets).toBeDefined();
            expect(imageData.differencePixelSets.length).toBeGreaterThan(0);
        },
        LONG_TEST_TIMEOUT,
    );

    it(
        'should reset all values',
        async () => {
            const object = images.fourDifferences.object;
            await object.findDifferences(PaddingRadius.THREE);
            object.resetAlgorithmData();
            expect(object.getActiveLines).toEqual([]);
            expect(object.getFollowingLines).toEqual([]);
            expect(object.getHistoricLineNbr).toEqual(0);
            expect(object.getAvailableId).toEqual(0);
            expect(object.getDifferences).toEqual([]);
        },
        LONG_TEST_TIMEOUT,
    );

    it(
        'should merge following Lines',
        async () => {
            const mergeSituation = new DifferenceLocator(
                images.fourDifferences.originalImagePath,
                './assets/tests/following-lines-test-image.bmp',
                Source.Path,
            );
            await mergeSituation.findDifferences(PaddingRadius.THREE);
            expect(mergeSituation.getDifferenceNbr).toEqual(3);
        },
        LONG_TEST_TIMEOUT,
    );
});
