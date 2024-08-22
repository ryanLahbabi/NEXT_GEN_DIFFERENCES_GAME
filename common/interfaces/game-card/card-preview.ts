import { BestTimes } from './best-times';

export interface CardPreview {
    id: string;
    name: string;
    difficulty: number;
    classicSoloBestTimes: BestTimes;
    classic1v1BestTimes: BestTimes;
    originalImage: string;
    nbrDifferences: number;
    likes: number;
}
