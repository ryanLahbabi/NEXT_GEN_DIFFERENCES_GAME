import { Component, Input } from '@angular/core';
import { Game } from '@app/classes/game-play/game';
import { CLASSIC_CARDS_MAX_CAPACITY, TIMED_CARDS_MAX_CAPACITY } from '@app/constants/game-selection-constants';
import { AccountService } from '@app/services/account/account.service';
import { GameListManagerService } from '@app/services/divers/game-list-manager.service';
import { ObserverService } from '@app/services/game-config/observer.service';
import { CarouselType } from '@common/enums/carousel-type';
import { Difficulty } from '@common/enums/game-play/difficulty';
import { GameMode } from '@common/enums/game-play/game-mode';
import { Language } from '@common/enums/user/language.enum';

@Component({
    selector: 'app-carousel-view',
    templateUrl: './carousel-view.component.html',
    styleUrls: ['./carousel-view.component.scss'],
})
export class CarouselViewComponent {
    @Input() type: CarouselType;
    private startIndex: number = 0;

    constructor(
        public gameListManager: GameListManagerService,
        private ongoingGameService: ObserverService,
        private accountService: AccountService,
    ) {}

    get games(): Game[] {
        switch (this.type) {
            case CarouselType.Join:
                return this.gameListManager.getJoinableGames(GameMode.ClassicDeathMatch);
            case CarouselType.Timed:
                return this.gameListManager.getJoinableGames(GameMode.LimitedTimeDeathMatch);
            case CarouselType.ObserveClassic:
                return this.ongoingGameService.getOngoingGames(GameMode.ClassicDeathMatch);
            case CarouselType.ObserveTimed:
                return this.ongoingGameService.getOngoingGames(GameMode.LimitedTimeDeathMatch);
            default:
                return this.gameListManager.games;
        }
    }

    get isTwoByTwo(): boolean {
        return this.type !== CarouselType.Timed && this.type !== CarouselType.ObserveTimed;
    }

    get maxCapacity(): number {
        return this.isTwoByTwo ? CLASSIC_CARDS_MAX_CAPACITY : TIMED_CARDS_MAX_CAPACITY;
    }

    getDifficulty(value: Difficulty): string {
        let difficulty: string;
        switch (value) {
            case Difficulty.Easy:
                if (this.accountService.userLanguage === Language.English) difficulty = 'easy';
                else difficulty = 'facile';
                break;
            case Difficulty.Hard:
                if (this.accountService.userLanguage === Language.English) difficulty = 'hard';
                else difficulty = 'difficile';
                break;
            default:
                if (this.accountService.userLanguage === Language.English) difficulty = 'medium';
                else difficulty = 'moyen';
        }
        return difficulty;
    }

    getDisplayedItems(): Game[] {
        if (this.canGoRight() || this.canGoLeft()) {
            const displayedGames = this.games.slice(this.startIndex, this.startIndex + this.maxCapacity);
            if (displayedGames.length === 0) this.goLeft();
            return displayedGames;
        }
        return this.games;
    }

    canGoRight(): boolean {
        return this.startIndex + this.maxCapacity < this.games.length;
    }

    canGoLeft(): boolean {
        return this.startIndex - this.maxCapacity >= 0;
    }

    goLeft() {
        this.startIndex -= this.maxCapacity;
        this.getDisplayedItems();
    }

    goRight() {
        this.startIndex += this.maxCapacity;
        this.getDisplayedItems();
    }
}
