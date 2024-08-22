import { GameAccessType } from '../../enums/game-play/game-access-type.enum';

export interface UpdateGameAccess {
    type: GameAccessType;
    gameId: string;
}
