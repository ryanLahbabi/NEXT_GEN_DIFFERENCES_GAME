import { GameAccessType } from '@common/enums/game-play/game-access-type.enum';
import { BestTimes } from '@common/interfaces/game-card/best-times';
import { CardPreview } from '@common/interfaces/game-card/card-preview';

export class Game {
    observerNbr?: number;
    cardId: string;
    gameId?: string;
    name: string;
    likes: number;
    difficulty: number;
    classicSoloBestTimes: BestTimes;
    classic1v1BestTimes: BestTimes;
    originalImage: string;
    gameStatus: boolean;
    nbrDifferences: number;
    waitingPlayers?: string[];
    playersWithAccess: string[];
    accessType?: GameAccessType;

    constructor(game: CardPreview, status: boolean = false) {
        this.cardId = game.id;
        this.name = game.name;
        this.likes = game.likes || 0;
        this.difficulty = game.difficulty;
        this.classicSoloBestTimes = game.classicSoloBestTimes;
        this.classic1v1BestTimes = game.classic1v1BestTimes;
        this.originalImage = game.originalImage;
        this.gameStatus = status;
        this.nbrDifferences = game.nbrDifferences;
    }
}
