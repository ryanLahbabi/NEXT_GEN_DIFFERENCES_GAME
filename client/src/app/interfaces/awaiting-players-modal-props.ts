import { SimpleUser } from '@common/interfaces/game-play/simple-user';

export interface AwaitingPlayersModalProps {
    playerName: string;
    gameId: string;
    waitingPlayers: SimpleUser[];
    displayMessage: number;
    isLimitedTime: boolean;
}
