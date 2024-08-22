import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '@app/classes/game-play/game';
import { INTERACTION_DELAY, INTERACTION_DURATION, INTERACTION_TEXT_SIZE } from '@app/constants/game-constants';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/images-constants';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { GameListManagerService } from '@app/services/divers/game-list-manager.service';
import { DrawService } from '@app/services/game-creation/foreground/draw.service';
import { ChatService } from '@app/services/game-play/chat.service';
import { GameDataService } from '@app/services/game-play/game-data.service';
import { GameInfo } from '@common/dto/game/game-info.dto';
import { ObserverHelpCoordinates } from '@common/dto/game/observer-help-coordinates.dto';
import { ObserverHelpResponseDTO } from '@common/dto/game/observer-help-response.dto';
import { ObserverStateDTO } from '@common/dto/game/observer-state.dto';
import { Difficulty } from '@common/enums/game-play/difficulty';
import { GameMode } from '@common/enums/game-play/game-mode';
import { InteractionState } from '@common/enums/interaction-state';
import { Coordinates } from '@common/interfaces/general/coordinates';
import * as Events from '@common/socket-event-constants';

@Injectable({
    providedIn: 'root',
})
export class ObserverService {
    state = InteractionState.Initial;
    targetPlayerName: string;
    interactionEvent: EventEmitter<ObserverHelpResponseDTO> = new EventEmitter<ObserverHelpResponseDTO>();

    private ongoingGames: { game: Game; mode: GameMode }[] = [];
    private firstCornerCoord: Coordinates;
    private secondCornerCoord: Coordinates;
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };

    // eslint-disable-next-line max-params
    constructor(
        private socketClientService: SocketClientService,
        private gameData: GameDataService,
        private router: Router,
        private gameListManagerService: GameListManagerService,
        private drawService: DrawService,
        private chatService: ChatService,
    ) {}

    init() {
        this.socketClientService.on(Events.FromServer.OBSERVER_HELP, this.receiveInteraction.bind(this));
        this.socketClientService.on(Events.FromServer.ONGOING_GAMES, (gameInfos: GameInfo[]) => {
            this.ongoingGames = gameInfos.map((gameInfo) => {
                const gameCard = this.gameListManagerService.games.filter((game) => game.cardId === gameInfo.cardId)[0];
                return {
                    game: {
                        observerNbr: gameInfo.observerNbr,
                        cardId: gameInfo.cardId,
                        waitingPlayers: gameInfo.waitingPlayers,
                        gameId: gameInfo.id,
                        name: gameCard?.name,
                        difficulty: gameCard?.difficulty,
                        classicSoloBestTimes: gameCard?.classicSoloBestTimes,
                        classic1v1BestTimes: gameCard?.classic1v1BestTimes,
                        originalImage: gameCard?.originalImage,
                        nbrDifferences: gameCard?.nbrDifferences,
                        gameStatus: false,
                    } as Game,
                    mode: gameInfo.gameMode,
                };
            });
        });
        this.socketClientService.on(Events.FromServer.ALL_GAME_CARDS, () => {
            this.socketClientService.send(Events.ToServer.ONGOING_GAMES);
        });
        this.socketClientService.on(Events.FromServer.JOIN_OBSERVER, (gameData) => {
            this.setupObservation(gameData);
            this.router.navigateByUrl('/game');
        });
    }

    getOngoingGames(mode: GameMode): Game[] {
        const modeOngoingGames = this.ongoingGames.filter((ongoingGame) => ongoingGame.mode === mode);
        return modeOngoingGames.map((ongoingGame) => ongoingGame.game);
    }

    setupObservation(gameData: ObserverStateDTO) {
        if (gameData.data) {
            this.chatService.addGamingChannel();
            this.chatService.gameId = gameData.data.gameId;
            this.gameData.gameMode = gameData.data.gameMode;
            this.gameData.gameValues = gameData.data.gameValues;
            this.gameData.chronometerTime = gameData.data.time;
            this.gameData.gameID = gameData.data.gameId;
            this.gameData.originalPicture = gameData.data.cards[0].originalImage;
            this.gameData.modifiedPicture = gameData.data.cards[0].modifiedImage;
            this.gameData.nextCardFile = gameData.data.cards.length > 1 ? gameData.data.cards[1] : undefined;
            this.gameData.difficulty = this.getDifficulty(gameData.data.cards[0].difficulty);
            this.gameData.nbOfPlayers = gameData.data.players.length;
            this.gameData.differenceNbr = gameData.data.cards[0].nbDifferences;
            this.gameData.gameName = gameData.data.cards[0].name;
            this.gameData.name = undefined;
            this.gameData.timeToStart = 0;
            this.gameData.playerNames = gameData.data.players.map((p) => p.name);
            this.gameData.chronoTime = gameData.data.time;
            this.gameData.isObserving = true;
            this.gameData.observerNbr = gameData.data.observerNbr;
            this.gameData.playerScores = gameData.data.players;
            this.gameData.foundDifferences = gameData.data.foundDifferences;
        } else {
            throw new Error('Data object was not set but observation was authorized by server.');
        }
    }

    joinGame(gameid: string): void {
        this.socketClientService.send(Events.ToServer.JOIN_OBSERVER, gameid);
    }

    startInteraction() {
        this.state = InteractionState.Started;
    }

    getNumberOfObservers(gameId: string): void {
        this.socketClientService.send(Events.ToServer.IS_PLAYING, gameId);
    }

    onMouseDown(coord: Coordinates): void {
        if (this.state === InteractionState.Started) {
            this.firstCornerCoord = coord;
            this.secondCornerCoord = coord;
        }
    }

    async onMouseMove(coord: Coordinates, context: CanvasRenderingContext2D): Promise<void> {
        if (this.state === InteractionState.Started) {
            this.secondCornerCoord = coord;
            await this.clearInteractions(context);
            this.drawInteraction(this.computeZoneCoordinates(), context);
        }
    }

    onMouseUp(context: CanvasRenderingContext2D): void {
        if (this.state === InteractionState.Started) {
            this.sendInteraction(this.computeZoneCoordinates());
            setTimeout(() => {
                this.clearInteractions(context);
            }, INTERACTION_DURATION);
        }
    }

    drawInteraction(zoneCoordinates: ObserverHelpCoordinates, context: CanvasRenderingContext2D, senderUsername?: string) {
        context.fillStyle = 'rgba(255, 255, 255, 0.3)';
        context.strokeStyle = 'yellow';
        context.lineWidth = 3;
        const dimensions = {
            x: zoneCoordinates.lowerRight.x - zoneCoordinates.upperLeft.x,
            y: zoneCoordinates.lowerRight.y - zoneCoordinates.upperLeft.y,
        };
        this.drawService.outlineRectangle(zoneCoordinates.upperLeft, dimensions, context);
        this.drawService.fillRectangle(zoneCoordinates.upperLeft, dimensions, context);
        if (senderUsername) {
            this.drawService.writeText(
                senderUsername,
                { x: zoneCoordinates.upperLeft.x, y: zoneCoordinates.lowerRight.y },
                context,
                INTERACTION_TEXT_SIZE,
                'black',
                'rgba(255, 255, 255, 0.5)',
            );
        }
    }

    async clearInteractions(context: CanvasRenderingContext2D) {
        await this.drawService.clearCanvas(this.canvasSize, context);
    }

    private sendInteraction(zoneCoordinates: ObserverHelpCoordinates) {
        this.socketClientService.send(Events.ToServer.OBSERVER_HELP, {
            gameId: this.gameData.gameID,
            zoneCoordinates,
            targetPlayerName: this.targetPlayerName !== 'all' ? this.targetPlayerName : undefined,
        });
        this.state = InteractionState.Waiting;
        setTimeout(() => {
            this.state = InteractionState.Initial;
        }, INTERACTION_DELAY);
    }

    private computeZoneCoordinates(): ObserverHelpCoordinates {
        const restrictedSecondCorner = {
            x: Math.min(this.secondCornerCoord.x, this.canvasSize.x),
            y: Math.min(this.secondCornerCoord.y, this.canvasSize.y),
        };
        restrictedSecondCorner.x = Math.max(restrictedSecondCorner.x, 0);
        restrictedSecondCorner.y = Math.max(restrictedSecondCorner.y, 0);
        const upperLeft = {
            x: Math.min(this.firstCornerCoord.x, restrictedSecondCorner.x),
            y: Math.max(this.firstCornerCoord.y, restrictedSecondCorner.y),
        };
        const lowerRight = {
            x: Math.max(this.firstCornerCoord.x, restrictedSecondCorner.x),
            y: Math.min(this.firstCornerCoord.y, restrictedSecondCorner.y),
        };
        return { upperLeft, lowerRight };
    }

    private receiveInteraction(interaction: ObserverHelpResponseDTO): void {
        this.interactionEvent.emit(interaction);
    }

    private getDifficulty(value?: Difficulty): string {
        let difficulty: string;
        switch (value) {
            case Difficulty.Easy:
                difficulty = 'facile';
                break;
            case Difficulty.Hard:
                difficulty = 'difficile';
                break;
            default:
                difficulty = '';
        }
        return difficulty;
    }
}
