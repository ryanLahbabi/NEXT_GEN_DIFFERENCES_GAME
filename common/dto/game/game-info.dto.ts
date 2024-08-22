import { GameMode } from '@common/enums/game-play/game-mode';

export interface GameInfo {
    id: string;
    gameMode: GameMode;
    cardId?: string;
    waitingPlayers: string[];
    observerNbr: number;
    playersWithAccess?: string[];
}
