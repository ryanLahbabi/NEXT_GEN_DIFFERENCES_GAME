import { HEIGHT, WIDTH } from '@app/class/algorithms/difference-locator/difference-locator.constants';
import { Error } from '@app/class/error-management/error.constants';
import Player from '@app/class/game-logic/player/player';
import PlayerGroup from '@app/class/player-groups/default-player-group/player-group';
import StopWatch from '@app/class/watch/stopwatch/stopwatch';
import Watch from '@app/class/watch/watch/watch';
import { GameConnectionData, User } from '@app/gateways/game.gateway.constants';
import OutputFilterGateway from '@app/gateways/output-filters.gateway';
import { PlayerRecordDocument } from '@app/model/database-schema/player-record.schema';
import MongoDBService from '@app/services/mongodb/mongodb.service';
import { InGameMessageDTO } from '@common/dto/game/in-game-message.dto';
import { ObserverHelpCoordinates } from '@common/dto/game/observer-help-coordinates.dto';
import { ObserverHelpResponseDTO } from '@common/dto/game/observer-help-response.dto';
import { ObserverStateDTO } from '@common/dto/game/observer-state.dto';
import { GameMode } from '@common/enums/game-play/game-mode';
import { ObserverState } from '@common/enums/game-play/observer-state.enum';
import { Sound } from '@common/enums/sound.enum';
import { Card } from '@common/interfaces/game-card/card';
import { CardBase64Files } from '@common/interfaces/game-card/card-base64-files';
import { CardFiles } from '@common/interfaces/game-card/card-files';
import { GameDifferenceImages } from '@common/interfaces/game-play/game-click.dto';
import { GameValues } from '@common/interfaces/game-play/game-values';
import { Coordinates } from '@common/interfaces/general/coordinates';
import { Socket } from 'socket.io';

export default abstract class Game {
    protected canCheat: boolean = true;
    protected gameMode: GameMode;
    protected gameValues: GameValues;
    protected id: string;
    protected isOngoing = false;
    protected gameWatch: Watch;
    protected gameTimer: StopWatch;
    protected startTime: string = Date();
    protected playerGroup: PlayerGroup;
    protected observerGroup: PlayerGroup;
    protected cardId: string;
    protected card: Card;
    protected cardFiles: CardBase64Files;
    protected messages: InGameMessageDTO[];
    protected foundDifferences: string[] = [];

    constructor(protected mongodbService: MongoDBService) {}

    get host() {
        if (this.playerGroup) return this.playerGroup.host;
        return undefined;
    }

    get getCanCheat() {
        return this.canCheat;
    }

    get getCardId() {
        return this.cardId;
    }

    get getGameMode(): GameMode {
        return this.gameMode;
    }
    get getId() {
        return this.id;
    }

    get getIsOngoing() {
        return this.isOngoing;
    }

    get playerGroupPlayers() {
        return this.playerGroup;
    }

    get observerGroupPlayers() {
        return this.observerGroup;
    }

    updateObserver(client: Socket, otherCards: CardFiles[]) {
        const players = [];
        this.playerGroup.forEachPlayer((p: Player) => {
            players.push({
                name: p.name,
                score: p.differencesFound,
            });
            return false;
        });
        const presentCardFiles: CardFiles = {
            name: this.card.name,
            originalImage: this.cardFiles.originalImage,
            modifiedImage: this.cardFiles.modifiedImage,
            nbDifferences: this.card.differenceNbr,
            difficulty: this.card.difficulty,
        };
        const observationData: ObserverStateDTO = {
            state: ObserverState.IsWatching,
            data: {
                cards: [presentCardFiles].concat(otherCards),
                foundDifferences: this.foundDifferences,
                messages: this.messages,
                players,
                gameMode: this.gameMode,
                time: this.gameTimer.getSeconds,
                gameValues: this.gameValues,
                gameId: this.id,
                observerNbr: this.observerGroup.getPlayerNbr,
            },
        };
        OutputFilterGateway.sendJoinObserverInfo.toClient(client, observationData);
    }

    initialize?(data: GameConnectionData): boolean;

    startGame?(clientId?: string): void;

    async endGame?(winner?: Player): Promise<void>;

    join?(user: User): boolean;

    async removePlayer?(playerId: string): Promise<boolean>;

    verifyClick(playerId: string, clickCoordinates: Coordinates, cb?: (found: GameDifferenceImages, player?: Player) => boolean): boolean {
        if (!this.isOngoing) return false;
        return this.playerGroup.forEachPlayer((player: Player) => {
            const matchingId = player.client.id === playerId;
            if (matchingId && !player.downTime) {
                const foundDifferenceValues = player.differenceManager.findDifference(clickCoordinates);
                if (cb(foundDifferenceValues, player)) return true;
            }
        });
    }

    findPlayer(playerId: string): Player | undefined {
        return this.playerGroup.getPlayer(playerId);
    }

    findObserver(observerId: string): Player | undefined {
        return this.observerGroup.getPlayer(observerId);
    }

    getLobbyIds(): string[] {
        return [this.playerGroup.getLobbyId];
    }

    getPlayerList(winners: Player[]): PlayerRecordDocument[] {
        const players = [];
        const existingWinners = winners.length !== 0;
        this.playerGroup.forEachPlayer((player: Player) => {
            let isAWinner = false;
            if (existingWinners)
                for (const winner of winners) {
                    if (winner)
                        if (winner.client.id === player.client.id) {
                            isAWinner = true;
                            break;
                        }
                }
            else isAWinner = true;
            players.push({
                name: player.name,
                winner: isAWinner,
                deserter: false,
            } as PlayerRecordDocument);
            return false;
        });
        this.playerGroup.getDeserters.forEach((deserter: Player) => {
            players.push({
                name: deserter.name,
                winner: false,
                deserter: true,
            } as PlayerRecordDocument);
        });
        return players;
    }

    sendSound(sound: Sound) {
        this.playerGroup.sendMessageToGroup(sound, OutputFilterGateway.sendSound);
        this.observerGroup.sendMessageToGroup(sound, OutputFilterGateway.sendSound);
    }

    // getHint(playerId: string): Hint {
    //     const player = this.findPlayer(playerId);
    //     if (player) {
    //         const hint = player.differenceManager?.hint;
    //         if (hint) {
    //             switch (this.gameMode) {
    //                 case GameMode.ClassicSolo:
    //                     this.gameWatch.add(this.gameValues.penaltyTime);
    //                     break;
    //                 case GameMode.Classic1v1:
    //                     break;
    //                 case GameMode.LimitedTimeCoop:
    //                     break;
    //                 case GameMode.LimitedTimeSolo:
    //                     this.gameWatch.remove(this.gameValues.penaltyTime);
    //                     break;
    //             }
    //         }
    //         return hint;
    //     }
    // }

    updateElo(winners: Player[]) {
        winners.forEach(async (w) => this.mongodbService.updateElo(w.name, true));
        this.playerGroup.forEachPlayer((p: Player) => {
            if (winners.find((w) => w.name === p.name) === undefined) this.mongodbService.updateElo(p.name, false);
            return false;
        });
    }

    helpPlayers(observerId: string, zoneCoordinates: ObserverHelpCoordinates, targetPlayerName?: string) {
        let observer: Player;
        if ((observer = this.observerGroup.getPlayer(observerId)) && !observer.downTime) {
            const zc = zoneCoordinates;
            const validXCoordinates = zc.upperLeft.x >= 0 && zc.lowerRight.x <= WIDTH && zc.upperLeft.x < zoneCoordinates.lowerRight.x;
            const validYCoordinates = zc.lowerRight.y >= 0 && zc.upperLeft.y <= HEIGHT && zc.lowerRight.y < zoneCoordinates.upperLeft.y;
            Error.Game.COORDINATES_OUT_OF_BOUND.generateErrorIf(!validXCoordinates).formatMessage('X');
            Error.Game.COORDINATES_OUT_OF_BOUND.generateErrorIf(!validYCoordinates).formatMessage('Y');

            const observerHelpDto: ObserverHelpResponseDTO = {
                observerUsername: observer.name,
                zoneCoordinates,
            };

            if (targetPlayerName) this.playerGroup.sendMessageToPlayerByName(targetPlayerName, observerHelpDto, OutputFilterGateway.sendObserverHelp);
            else this.playerGroup.sendMessageToGroup(observerHelpDto, OutputFilterGateway.sendObserverHelp);
            observer.startPenalty(3);
        }
    }
}
