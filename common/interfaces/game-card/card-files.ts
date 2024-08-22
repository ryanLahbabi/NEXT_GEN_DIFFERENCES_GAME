import { Difficulty } from '@common/enums/game-play/difficulty';

export interface CardFiles {
    name: string;
    originalImage: string;
    modifiedImage: string;
    nbDifferences: number;
    difficulty?: Difficulty;
}
