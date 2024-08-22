import { Difficulty } from '../../enums/game-play/difficulty';
import { FinalDifference } from '../difference-locator-algorithm/final-difference';
import { BestTimes } from './best-times';

export interface Card {
    id?: string;
    name: string;
    classicSoloBestTimes: BestTimes;
    classic1v1BestTimes: BestTimes;
    difficulty: Difficulty;
    differenceNbr: number;
    differences: FinalDifference[];
    likes: number;
}
