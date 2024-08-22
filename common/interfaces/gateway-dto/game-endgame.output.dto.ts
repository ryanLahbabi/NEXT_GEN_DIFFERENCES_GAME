import { BestTimes } from '../game-card/best-times';
import { PlayerRecord } from '../records/player-record';

export interface EndgameOutputDto {
    finalTime?: number;
    newBestTimes?: BestTimes;
    players: PlayerRecord[];
}
