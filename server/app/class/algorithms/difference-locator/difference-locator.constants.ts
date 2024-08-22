import SphereGenerator from '@app/class/algorithms/sphere-generator/sphere-generator';
import { PaddingRadius } from '@common/enums/game-creation/padding-radius';
import { LinearPixelSet } from '@common/interfaces/difference-locator-algorithm/linear-pixel-set';
import * as Jimp from 'jimp';

export const OPAQUE = 255;
export const CARDS_PATH = './assets/cards';
export const MIN_DIFFERENCE_NBR = 3;
export const MAX_DIFFERENCE_NBR = 9;
export const EASY_DIFFERENCE_NBR_INTERVAL = { start: MIN_DIFFERENCE_NBR, end: 6 };
export const HARD_DIFFERENCE_NBR_INTERVAL = { start: 7, end: MAX_DIFFERENCE_NBR };
export const LONG_TEST_TIMEOUT = 20000;

export const HEIGHT = 480;
export const WIDTH = 640;

export namespace SphereValues {
    export const zero = SphereGenerator.generate(PaddingRadius.ZERO).points;
    export const three = SphereGenerator.generate(PaddingRadius.THREE).points;
    export const nine = SphereGenerator.generate(PaddingRadius.NINE).points;
    export const fifteen = SphereGenerator.generate(PaddingRadius.FIFTEEN).points;
}

export interface DifferenceImageData {
    originalImage: Jimp;
    modifiedImage: Jimp;
    differencePixelSets: LinearPixelSet[][];
}
