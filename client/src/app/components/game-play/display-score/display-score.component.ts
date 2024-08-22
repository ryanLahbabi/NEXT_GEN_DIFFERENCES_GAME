import { Component, Input, OnDestroy } from '@angular/core';
import { GameDataService } from '@app/services/game-play/game-data.service';
import { GameService } from '@app/services/game-play/game.service';
import { GameMode } from '@common/enums/game-play/game-mode';

@Component({
    selector: 'app-display-score',
    templateUrl: './display-score.component.html',
    styleUrls: ['./display-score.component.scss'],
})
export class DisplayScoreComponent implements OnDestroy {
    @Input() playerScores: { name: string; score: number }[];
    @Input() isObserving: boolean;
    constructor(public gameService: GameService, public gameData: GameDataService) {}

    get differencesLeft(): number | undefined {
        if (this.gameData.nbOfPlayers === 1) {
            return this.gameService.totalDifferences;
        } else {
            return Math.ceil((this.gameService.totalDifferences + 1) / 2);
        }
    }

    ngOnDestroy(): void {
        this.gameService.cleanup();
    }

    isLimitedTimeMode(): boolean {
        return (
            this.gameData.gameMode === GameMode.LimitedTimeSolo ||
            this.gameData.gameMode === GameMode.LimitedTimeCoop ||
            this.gameData.gameMode === GameMode.LimitedTimeDeathMatch
        );
    }
}
