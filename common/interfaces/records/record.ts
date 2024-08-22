import { GameMode } from '../../enums/game-play/game-mode';
import { TimeConcept } from '../general/time-concept';
import { PlayerRecord } from './player-record';

export interface Record {
    startDate: string;
    duration: TimeConcept;
    gameMode: GameMode;
    players: PlayerRecord[];
}
