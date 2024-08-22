import { BestTimes } from '@common/interfaces/game-card/best-times';
import { CardPreview } from '@common/interfaces/game-card/card-preview'; // Ensure this path is correct
import { TimeConcept } from '@common/interfaces/general/time-concept';
import { Game } from './game'; // Adjust the import path as necessary

const timeExample: TimeConcept = {
    minutes: 5,
    seconds: 30,
};

const gameBestTimes: BestTimes = {
    firstPlace: { name: 'Alice', time: timeExample },
    secondPlace: { name: 'Bob', time: timeExample },
    thirdPlace: { name: 'Charlie', time: timeExample },
};

// Dummy data for testing
const mockCardPreview: CardPreview = {
    id: '1',
    name: 'Test Game',
    difficulty: 5,
    classicSoloBestTimes: gameBestTimes,
    classic1v1BestTimes: gameBestTimes,
    originalImage: 'image-url',
    nbrDifferences: 10,
    likes: 0,
};

describe('Game', () => {
    it('should create an instance', () => {
        const game = new Game(mockCardPreview);
        expect(game).toBeTruthy();
        expect(game.name).toBe('Test Game');
    });
});
