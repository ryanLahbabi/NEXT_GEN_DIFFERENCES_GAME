import { Component, Input, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Game } from '@app/classes/game-play/game';
import { AccountService } from '@app/services/account/account.service';
import { HttpService } from '@app/services/communication/http.service';
import { GameSelectorService } from '@app/services/game-selection/game-selector.service';
import { CarouselType } from '@common/enums/carousel-type';
import { LikeOperation } from '@common/enums/like-operation.enum';
import { Language } from '@common/enums/user/language.enum';

@Component({
    selector: 'app-game-select',
    templateUrl: './game-select.component.html',
    styleUrls: ['./game-select.component.scss'],
})
export class GameSelectComponent implements SafeResourceUrl, OnInit {
    @Input() type: CarouselType;
    @Input() game: Game;
    @Input() difficulty: string;

    waitingPlayers: string[];

    constructor(public selectorService: GameSelectorService, private accountService: AccountService, private httpService: HttpService) {}

    get isLiked() {
        return this.accountService.currentUser?.likedCards.includes(this.game.cardId);
    }

    get isDisliked() {
        return this.accountService.currentUser?.dislikedCards.includes(this.game.cardId);
    }

    get buttonName(): string {
        switch (this.type) {
            case CarouselType.Admin:
                if (this.accountService.userLanguage === Language.French) return 'Supprimer le jeu';
                return 'Delete the game';
            case CarouselType.Create:
                if (this.accountService.userLanguage === Language.French) return 'Créer une partie';
                return 'Create a game';
            case CarouselType.Join:
            case CarouselType.Timed:
                if (this.accountService.userLanguage === Language.French) return 'Rejoindre la partie';
                return 'Join the game';
            case CarouselType.ObserveClassic:
            case CarouselType.ObserveTimed:
                if (this.accountService.userLanguage === Language.French) return 'Observer la partie';
                return 'Observe the game';
            default:
                return '';
        }
    }

    get isTimed(): boolean {
        return this.type === CarouselType.Timed || this.type === CarouselType.ObserveTimed;
    }

    get hasPlayerList(): boolean {
        return this.type === CarouselType.Join || this.type === CarouselType.ObserveClassic;
    }

    get isOngoing(): boolean {
        return this.type === CarouselType.ObserveClassic || this.type === CarouselType.ObserveTimed;
    }

    get isCreate(): boolean {
        return this.type === CarouselType.Create;
    }

    ngOnInit(): void {
        this.waitingPlayers = this.game.waitingPlayers ? this.game.waitingPlayers : [];
    }

    sendSelection() {
        switch (this.type) {
            case CarouselType.Admin:
            case CarouselType.Create:
                this.selectorService.setSelectionValue(this.type, this.game.cardId);
                break;
            case CarouselType.Join:
            case CarouselType.Timed:
            case CarouselType.ObserveClassic:
            case CarouselType.ObserveTimed:
                this.selectorService.setSelectionValue(this.type, this.game.gameId ? this.game.gameId : '');
                break;
        }
    }

    removeLikedCard(cardId: string) {
        if (this.accountService.currentUser)
            this.accountService.currentUser.likedCards = this.accountService.currentUser.likedCards.filter((c) => c !== cardId);
    }

    removDislikedCard(cardId: string) {
        if (this.accountService.currentUser)
            this.accountService.currentUser.dislikedCards = this.accountService.currentUser.dislikedCards.filter((c) => c !== cardId);
    }

    like() {
        const cardId = this.game.cardId;
        const liked = this.isLiked;
        const disliked = this.isDisliked;
        if (liked) {
            this.httpService.likeFunction(cardId, LikeOperation.Neutral).then((info) => {
                this.game.likes = info.cardLikes;
                this.removeLikedCard(cardId);
            });
        } else {
            this.httpService.likeFunction(cardId, LikeOperation.Like).then((info) => {
                this.game.likes = info.cardLikes;
                if (disliked) this.removDislikedCard(cardId);
                this.accountService.currentUser?.likedCards.push(cardId);
            });
        }
    }

    dislike() {
        const cardId = this.game.cardId;
        if (this.isDisliked) {
            this.httpService.likeFunction(cardId, LikeOperation.Neutral).then((info) => {
                this.game.likes = info.cardLikes;
                this.removDislikedCard(cardId);
            });
        } else {
            this.httpService.likeFunction(cardId, LikeOperation.Dislike).then((info) => {
                this.game.likes = info.cardLikes;
                if (this.isLiked) this.removeLikedCard(cardId);
                this.accountService.currentUser?.dislikedCards.push(cardId);
            });
        }
    }
}
