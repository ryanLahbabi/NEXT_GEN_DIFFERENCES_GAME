import { GameStatisticsDTO } from './game-statistics.dto';

export interface GeneralGameStatisticsDTO {
    classicDeathMatch: GameStatisticsDTO;
    limitedTimeDeathMatch: GameStatisticsDTO;
    generalGameData: GameStatisticsDTO;
}
