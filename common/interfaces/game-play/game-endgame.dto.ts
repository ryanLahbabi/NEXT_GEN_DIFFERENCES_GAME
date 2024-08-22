import { BestTimes } from '../../interfaces/game-card/best-times';
import { PlayerRecord } from '../../interfaces/records/player-record';

export interface EndgameOutputDto {
    finalTime?: number;
    newBestTimes?: BestTimes;
    players: PlayerRecord[];
}
