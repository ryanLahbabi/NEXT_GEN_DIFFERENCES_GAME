import { Difficulty } from '../../enums/game-play/difficulty';
import { GameConnectionAttemptResponseType } from '../../enums/game-play/game-connection-attempt-response-type';
import { GameValues } from './game-values';
import { SimpleUser } from './simple-user';

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
    members?: SimpleUser[];
    canCheat?: boolean;
}
