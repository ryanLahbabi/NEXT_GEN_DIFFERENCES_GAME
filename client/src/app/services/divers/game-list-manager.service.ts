import { Injectable } from '@angular/core';
import { Game } from '@app/classes/game-play/game';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { FriendsService } from '@app/services/friends/friends.service';
import { PrivateUserDataDTO } from '@common/dto/user/private-user-data.dto';
import { GameAccessType } from '@common/enums/game-play/game-access-type.enum';
import { GameMode } from '@common/enums/game-play/game-mode';
import { CardPreview } from '@common/interfaces/game-card/card-preview';
import * as Events from '@common/socket-event-constants';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameListManagerService {
    games: Game[] = [];
    gameToUpdate: Game | undefined;
    accessType: GameAccessType;
    accessTypeSource = new BehaviorSubject<GameAccessType>(GameAccessType.Everyone);
    accessType$ = this.accessTypeSource.asObservable();
    userData: PrivateUserDataDTO;
    receiptAccess: string;
    // private oldGames?: { gameId: string, access: GameAccessType }[] = [];
    //    oldGames: { gameId: string, access: GameAccessType }[];
    oldGames: { [gameId: string]: GameAccessType } = {}; // Define oldGames as a dictionary
    private joinableGames: { game: Game; mode: GameMode }[] = [];
    // private awaitingAccessType: boolean = false;

    constructor(private socket: SocketClientService, private friendsService: FriendsService) {}

    getJoinableGames(mode: GameMode): Game[] {
        const modeJoinableGames = this.joinableGames.filter((joinableGames) => joinableGames.mode === mode);

        return modeJoinableGames
            .filter((joinableGame) => {
                this.friendsService.updateFriendsFounded();
                if (
                    joinableGame.game.waitingPlayers?.some((playerUsername) => this.userData.blockRelations.includes(playerUsername)) &&
                    !joinableGame.game.waitingPlayers?.some((playerUsername) => this.userData.hasBlocked.includes(playerUsername))
                ) {
                    return false;
                }

                // if (joinableGame.game.accessType === undefined && !this.awaitingAccessType) {
                //     this.awaitingAccessType = true;
                //     this.socket.send(Events.ToServer.REQUEST_ACCESS_TYPE);
                // }

                // console.log(joinableGame.game.gameId);

                // console.log(joinableGame.game.accessType);

                const playersWithAccess = joinableGame.game.playersWithAccess || [];
                switch (joinableGame.game.accessType) {
                    case GameAccessType.Everyone:
                        return true;

                    case GameAccessType.Friends:
                        if (this.userData && playersWithAccess.includes(this.userData.username)) {
                            return true;
                        }
                        return false;
                    case GameAccessType.FriendsOfFriends: {
                        if (this.userData && playersWithAccess.includes(this.userData.username)) {
                            return true;
                        }
                        const friends = this.friendsService.getFriends(this.userData ? this.userData.username : '');
                        return friends.some((friend) => playersWithAccess.includes(friend));
                    }
                    default:
                        return false;
                }
            })
            .map((joinableGame) => joinableGame.game);
    }

    init(userData: PrivateUserDataDTO) {
        this.userData = userData;
        this.socket.on(Events.FromServer.ALL_GAME_CARDS, (games: typeof Events.FromServer.ALL_GAME_CARDS.type) => {
            this.socket.send<void>(Events.ToServer.JOINABLE_GAME_CARDS);
            this.games = [];
            games.forEach((game: CardPreview) => {
                this.games.push(new Game(game));
            });
        });
        this.socket.on(Events.FromServer.LIKES, (info: { cardId: string; likes: number }) => {
            const card = this.games.find((g) => g.cardId === info.cardId);
            if (card) card.likes = info.likes;
        });
        this.socket.on(Events.FromServer.GAME_CARD, (game: CardPreview) => {
            this.games.push(new Game(game));
        });
        // this.socket.on(Events.FromServer.FRONTEND_CARD_TIMES, this.updateGameScore.bind(this));
        this.socket.on(Events.FromServer.JOINABLE_GAME_CARDS, this.updateGameStatus.bind(this));
        // this.socket.on(Events.FromServer.ALL_FRONTEND_CARD_TIMES, this.updateAllGameScore.bind(this));
        this.socket.on(Events.FromServer.UPDATE_ACCESS_TYPE, this.updateAccessType.bind(this));

        this.socket.send<void>(Events.ToServer.ALL_GAME_CARDS);
    }

    deleteGame(id: string) {
        this.games.splice(
            this.games.findIndex((game) => {
                return game.cardId === id;
            }),
            1,
        );
        this.socket.send(Events.ToServer.DELETE_CARD, id);
    }

    deleteAllGames() {
        this.games = [];
        this.socket.send(Events.ToServer.DELETE_ALL_CARDS);
    }

    // resetBestTimes(cardId: string) {
    //     this.socket.send(Events.ToServer.RESET_BEST_TIMES, cardId);
    // }

    // resetAllBestTimes() {
    //     this.socket.send(Events.ToServer.RESET_ALL_BEST_TIMES);
    // }

    sendAccessType(accessType: GameAccessType, gameId: string) {
        const body = {
            gameId,
            type: accessType,
        };
        // this.socket.on(Events.FromServer.REQUEST_ACCESS_TYPE, (data => this.socket.send(Events.ToServer.UPDATE_ACCESS_TYPE, body)));
        this.socket.send(Events.ToServer.UPDATE_ACCESS_TYPE, body);
    }

    updateAccessType(data: typeof Events.FromServer.UPDATE_ACCESS_TYPE.type) {
        this.oldGames[data.gameId] = data.type;
        const joinableGame = this.joinableGames.find((j) => j.game.gameId === data.gameId);
        if (joinableGame) {
            joinableGame.game.accessType = data.type;
            this.accessTypeSource.next(data.type);
        }
    }

    private updateGameStatus(joinableGames: typeof Events.FromServer.JOINABLE_GAME_CARDS.type) {
        this.joinableGames = joinableGames.map((gameInfo) => {
            const oldAccessType = this.oldGames[gameInfo.id];
            const gameCard = this.games.filter((game) => game.cardId === gameInfo.cardId)[0];
            return {
                game: {
                    cardId: gameInfo.cardId,
                    waitingPlayers: gameInfo.waitingPlayers,
                    gameId: gameInfo.id,
                    playersWithAccess: gameInfo.playersWithAccess,
                    name: gameCard?.name,
                    difficulty: gameCard?.difficulty,
                    classicSoloBestTimes: gameCard?.classicSoloBestTimes,
                    classic1v1BestTimes: gameCard?.classic1v1BestTimes,
                    originalImage: gameCard?.originalImage,
                    nbrDifferences: gameCard?.nbrDifferences,
                    gameStatus: false,
                    accessType: oldAccessType ? oldAccessType : GameAccessType.Everyone,
                } as Game,
                mode: gameInfo.gameMode,
            };
        });
    }

    // updateAccessTypeOnQuit(games: { [gameId: string]: GameAccessType }): void {
    //     Object.entries(games).forEach(([gameId, accessType]) => {
    //         // console.log("Updating access for game ID:", gameId, "to access type:", accessType);

    //         const gameIndex = this.joinableGames.findIndex((joinableGame) => joinableGame.game.gameId === gameId);

    //         if (gameIndex !== -1) {
    //             this.joinableGames[gameIndex].game.accessType = accessType;
    //             this.accessTypeSource.next(accessType);
    //             this.gameToUpdate = this.joinableGames[gameIndex].game;
    //         }
    //     });
    // }

    // private updateGameScore(newScore: typeof Events.FromServer.FRONTEND_CARD_TIMES.type) {
    //     const game = this.games.find((card: Game) => {
    //         return card.cardId === newScore.id;
    //     });
    //     if (game) {
    //         if (newScore.classicSoloBestTimes) game.classicSoloBestTimes = newScore.classicSoloBestTimes;
    //         if (newScore.classic1v1BestTimes) game.classic1v1BestTimes = newScore.classic1v1BestTimes;
    //     }
    // }

    // private updateAllGameScore(newScores: typeof Events.FromServer.ALL_FRONTEND_CARD_TIMES.type) {
    //     newScores.forEach((newScore) => this.updateGameScore(newScore));
    // }
}
