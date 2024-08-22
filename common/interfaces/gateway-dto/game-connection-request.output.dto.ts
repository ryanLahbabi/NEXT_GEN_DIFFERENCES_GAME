import { Difficulty } from '../../enums/game-play/difficulty';
import { GameConnectionAttemptResponseType } from '../../enums/game-play/game-connection-attempt-response-type';
import { GameValues } from '../game-play/game-values';

export interface GameConnectionRequestOutputMessageDto {
    responseType: GameConnectionAttemptResponseType;
    gameName: string;
    playerNbr: number;
    startingIn: number;
    originalImage: string;
    modifiedImage: string;
    time: number;
    gameId: string;
    difficulty: Difficulty;
    differenceNbr: number;
    hostName: string;
    gameValues: GameValues;
}
