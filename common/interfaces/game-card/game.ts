export interface Game {
    cardId: string;
    name: string;
    difficulty: string;
    numberOfDifference: number;
    bestTimes: string[];
    originalImage: string;
    modifiedImage: string;
    differenceImage: unknown[];
}
