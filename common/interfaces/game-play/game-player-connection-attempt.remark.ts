import { PlayerConnectionStatus } from '../../enums/game-play/player-connection-status';
import { SimpleUser } from './simple-user';

export interface GamePlayerConnectionAttemptRemarkFilter {
    playerConnectionStatus: PlayerConnectionStatus;
    user: SimpleUser;
    playerNbr?: number;
}
