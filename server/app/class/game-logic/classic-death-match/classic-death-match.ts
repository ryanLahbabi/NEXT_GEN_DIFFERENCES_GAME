import FileSystemManager from '@app/class/diverse/file-system-manager/file-system-manager';
import { Error } from '@app/class/error-management/error.constants';
import DifferenceManager from '@app/class/game-logic/difference-manager/difference-manager';
import Game from '@app/class/game-logic/game-interfaces/game-interface';
import { MAX_OBSERVER_NBR, MAX_PLAYER_NBR } from '@app/class/game-logic/limited-time-death-match/limited-time-death-match.constants';
import Player from '@app/class/game-logic/player/player';
import PlayerGroup from '@app/class/player-groups/default-player-group/player-group';
import StopWatch from '@app/class/watch/stopwatch/stopwatch';
import Timer from '@app/class/watch/timer/timer';
import { oneSecond } from '@app/class/watch/watch/watch.constants';
import { GameConnectionData, User } from '@app/gateways/game.gateway.constants';
import OutputFilterGateway from '@app/gateways/output-filters.gateway';
import ChannelManagerService from '@app/services/chat/channel-manager.service';
import GameAuthorityService from '@app/services/game-authority/game-authority.service';
import MongoDBService from '@app/services/mongodb/mongodb.service';
import { GlobalActionType } from '@common/enums/channel/global-action-type.enum';
import { GameConnectionAttemptResponseType } from '@common/enums/game-play/game-connection-attempt-response-type';
import { GameMode } from '@common/enums/game-play/game-mode';
import { PlayerConnectionStatus } from '@common/enums/game-play/player-connection-status';
import { GameClickOutputDto, GameDifferenceImages } from '@common/interfaces/game-play/game-click.dto';
import { GameConnectionRequestOutputMessageDto } from '@common/interfaces/game-play/game-connection-request.dto';
import { EndgameOutputDto } from '@common/interfaces/game-play/game-endgame.dto';
import { SimpleUser } from '@common/interfaces/game-play/simple-user';
import { Coordinates } from '@common/interfaces/general/coordinates';
import { PlayerRecord } from '@common/interfaces/records/player-record';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

export default class ClassicDeathMatch extends Game {
    private kickedUserIds = [];
    private totalDifferencesFound = 0;
    private readonly maxPlayerNbr = MAX_PLAYER_NBR;

    constructor(mongodbService: MongoDBService) {
        super(mongodbService);
        this.gameMode = GameMode.ClassicDeathMatch;
    }

    // getHint(playerId: string): Hint {
    //     if (this.canCheat) return super.getHint(playerId);
    // }

    initialize(data: GameConnectionData): boolean {
        try {
            this.observerGroup = new PlayerGroup(0, MAX_OBSERVER_NBR);
            this.id = data.user.client.id;
            const cardExists = GameAuthorityService.validCards.includes(data.cardId);
            Error.Card.CARD_DOES_NOT_EXIST.generateErrorIf(!cardExists).formatMessage(data.cardId);
            this.cardId = data.cardId;
            this.playerGroup = new PlayerGroup(2, this.maxPlayerNbr);
            this.join(data.user);

            this.mongodbService.getCardById(data.cardId).then((card) => {
                this.card = card;
                GameAuthorityService.getPendingGames.addGame(this);
                this.cardFiles = FileSystemManager.getImages(this.card);
                if (!this.cardFiles) {
                    this.endGame();
                    return;
                }
            });
            return true;
        } catch (e) {
            OutputFilterGateway.sendConnectionAttemptResponseMessage.toClient(data.user.client, {
                responseType: GameConnectionAttemptResponseType.Cancelled,
            } as GameConnectionRequestOutputMessageDto);
            this.playerGroup?.empty();
            Logger.error(e);
            return false;
        }
    }

    setGameValues(totalTime: number, canCheat: boolean) {
        this.gameValues = {
            timerTime: totalTime,
            penaltyTime: undefined,
            gainedTime: undefined,
        };
        this.canCheat = canCheat;
    }

    startGame() {
        if (!this.playerGroup.isValid) return;
        Error.Game.NOT_ENOUGH_PLAYERS.generateErrorIf(!this.playerGroup.isValid).formatMessage(this.id, this.playerGroup.getPlayerNbr.toString());
        this.playerGroup.forEachPlayer((player: Player) => {
            player.differenceManager = new DifferenceManager(this.card, this.cardFiles);
            return false;
        });
        GameAuthorityService.startGame(this.id);
        this.isOngoing = true;
        const startMessage: GameConnectionRequestOutputMessageDto = {
            responseType: GameConnectionAttemptResponseType.Starting,
            gameName: this.card.name,
            startingIn: 0,
            modifiedImage: this.cardFiles.modifiedImage,
            originalImage: this.cardFiles.originalImage,
            gameId: this.id,
            difficulty: this.card.difficulty,
            time: 0,
            differenceNbr: this.card.differenceNbr,
            playerNbr: 2,
            hostName: this.playerGroup.host.name,
            gameValues: this.gameValues,
            canCheat: this.canCheat,
        };
        OutputFilterGateway.sendConnectionAttemptResponseMessage.toLobby(this.playerGroup.getLobbyId, startMessage);
        this.gameWatch = new Timer();
        this.gameTimer = new StopWatch();
        this.gameWatch.set(this.gameValues.timerTime);
        this.gameWatch.onEnd = async () => this.endGame();
        this.gameWatch.eachInterval = () => {
            OutputFilterGateway.sendTime.toLobby(this.playerGroup.getLobbyId, this.gameWatch.getTicks);
            OutputFilterGateway.sendTime.toLobby(this.observerGroup.getLobbyId, this.gameWatch.getTicks);
        };
        this.gameWatch.start();
        this.gameTimer.start();
    }

    join(user: User): boolean {
        // TODO - verify that the observer is not playing
        if (this.isOngoing && this.observerGroup) {
            this.observerGroup.joinUser(user, (p) => {
                this.playerGroup.sendMessageToGroup(this.observerGroup.getPlayerNames, OutputFilterGateway.sendObserverList);
                this.observerGroup.sendMessageToGroup(this.observerGroup.getPlayerNames, OutputFilterGateway.sendObserverList);
                OutputFilterGateway.sendOnGoingGames.toServer(GameAuthorityService.getOngoingGames.getGamesInfos);
                p.avatar = user.avatar;
            });
            return true;
        }
        if (this.kickedUserIds.includes(user.client.id) || this.isOngoing) return false;

        const joined = this.playerGroup.joinUser(user, (p) => {
            p.avatar = user.avatar;
        });
        if (joined) {
            const playerNames: SimpleUser[] = [];
            this.playerGroup.forEachPlayer((p) => {
                playerNames.push({ name: p.name, id: p.client.id, avatar: p.avatar });
                return false;
            });
            const waitingMessage: GameConnectionRequestOutputMessageDto = {
                responseType: GameConnectionAttemptResponseType.Pending,
                gameId: this.id,
                playerNbr: this.playerGroup.getPlayerNbr,
                hostName: this.playerGroup.host.name,
                members: playerNames,
            } as GameConnectionRequestOutputMessageDto;

            OutputFilterGateway.sendConnectionAttemptResponseMessage.toClient(user.client, waitingMessage);
            OutputFilterGateway.sendPlayerConnectionMessage.broadcast(
                user.client,
                {
                    playerConnectionStatus: PlayerConnectionStatus.Joined,
                    user: {
                        name: user.name,
                        id: user.client.id,
                        avatar: user.avatar,
                    },
                },
                this.playerGroup.getLobbyId,
            );

            if (this.playerGroup.getPlayerNbr === this.maxPlayerNbr) {
                GameAuthorityService.joinableGames = GameAuthorityService.joinableGames.filter((g) => g.id !== this.id);
                OutputFilterGateway.sendJoinableGames.toServer(GameAuthorityService.joinableGames);
            }
        }
        return joined;
    }

    async endGame(winner?: Player) {
        if (this.isOngoing) {
            this.gameTimer.pause();
            this.gameWatch.pause();
            this.isOngoing = false;
            let winners: Player[] = [];
            let players: PlayerRecord[] = [];
            if (!winner) {
                this.playerGroup.forEachPlayer((p: Player) => {
                    if (!winners.length || winners[0].differencesFound < p.differencesFound) winners = [p];
                    else if (winners[0].differencesFound === p.differencesFound) winners.push(p);
                    return false;
                });
                players = this.getPlayerList(winners);
            } else {
                winners.push(winner);
                players = this.getPlayerList(winners);
                ChannelManagerService.sendGlobalAction(GlobalActionType.MatchResult, winner.name);
            }
            this.playerGroup.forEachPlayer((p: Player) => {
                const hasWon = players.find((player) => p.name === player.name).winner;
                this.mongodbService.updateGameData(p.name, this.gameMode, this.gameTimer.getTicks, p.differencesFound, hasWon);
                return false;
            });
            this.updateElo(winners);

            const endMessage: EndgameOutputDto = {
                finalTime: this.gameWatch.getSeconds,
                players,
            };
            OutputFilterGateway.sendEndgameMessage.toLobby(this.observerGroup.getLobbyId, endMessage);
            OutputFilterGateway.sendEndgameMessage.toLobby(this.playerGroup.getLobbyId, endMessage);
            GameAuthorityService.getOngoingGames.removeGame(this.id);
            OutputFilterGateway.sendOnGoingGames.toServer(GameAuthorityService.getOngoingGames.getGamesInfos);
        } else {
            GameAuthorityService.removeJoinableGames(this.id);
            GameAuthorityService.getPendingGames.removeGame(this.id);
            OutputFilterGateway.sendJoinableGames.toServer(GameAuthorityService.joinableGames);
            const cancelMessage = {
                responseType: GameConnectionAttemptResponseType.Cancelled,
                gameId: this.id,
            } as GameConnectionRequestOutputMessageDto;
            OutputFilterGateway.sendConnectionAttemptResponseMessage.toLobby(this.playerGroup.getLobbyId, cancelMessage);
        }
        this.playerGroup.empty();
        this.observerGroup.empty();
    }

    kickWaitingPlayer(playerId: string) {
        const player = this.playerGroup.leave(playerId, false);
        this.kickedUserIds.push(playerId);
        if (player) {
            OutputFilterGateway.sendConnectionAttemptResponseMessage.toClient(player.client, {
                responseType: GameConnectionAttemptResponseType.Rejected,
                gameId: this.id,
            } as GameConnectionRequestOutputMessageDto);
            OutputFilterGateway.sendPlayerConnectionMessage.toLobby(this.playerGroup.getLobbyId, {
                playerConnectionStatus: PlayerConnectionStatus.Left,
                user: {
                    name: player.name,
                    id: player.client.id,
                    avatar: undefined,
                },
            });
        }
    }

    async removePlayer(playerId: string): Promise<boolean> {
        const removedPlayer = this.playerGroup.leave(playerId, this.isOngoing);
        if (removedPlayer !== undefined) {
            if (this.playerGroup.getPlayerNbr === 0) this.endGame();
            else if (this.isOngoing) {
                if (this.playerGroup.getPlayerNbr > 1)
                    OutputFilterGateway.sendDeserterMessage.toLobby(this.playerGroup.getLobbyId, removedPlayer.name);
                else this.endGame();
            } else {
                GameAuthorityService.joinableGames.forEach((g) => {
                    if (g.id === this.id) {
                        g.waitingPlayers = g.waitingPlayers.filter((n) => n !== removedPlayer.name);
                    }
                });
                if (this.playerGroup.getPlayerNbr === this.maxPlayerNbr - 1) {
                    const playerNames: string[] = [];
                    this.playerGroup.forEachPlayer((p) => {
                        playerNames.push(p.name);
                        return false;
                    });
                    GameAuthorityService.joinableGames.push({
                        id: this.id,
                        gameMode: this.gameMode,
                        waitingPlayers: playerNames,
                        cardId: this.cardId,
                        observerNbr: 0,
                    });
                }
                OutputFilterGateway.sendPlayerConnectionMessage.toLobby(this.playerGroup.getLobbyId, {
                    playerConnectionStatus: PlayerConnectionStatus.Left,
                    user: {
                        name: removedPlayer.name,
                        id: removedPlayer.client.id,
                        avatar: undefined,
                    },
                });
            }
        } else if (this.isOngoing) {
            this.observerGroup.leave(playerId, false);
            this.playerGroup.sendMessageToGroup(this.observerGroup.getPlayerNames, OutputFilterGateway.sendObserverList);
            this.observerGroup.sendMessageToGroup(this.observerGroup.getPlayerNames, OutputFilterGateway.sendObserverList);
            OutputFilterGateway.sendOnGoingGames.toServer(GameAuthorityService.getOngoingGames.getGamesInfos);
        }
        return removedPlayer !== undefined;
    }

    updateObserver(client: Socket) {
        super.updateObserver(client, []);
    }

    verifyClick(playerId: string, clickCoordinates: Coordinates): boolean {
        return super.verifyClick(playerId, clickCoordinates, (foundDifferenceValues: GameDifferenceImages, player: Player) => {
            if (foundDifferenceValues) {
                this.totalDifferencesFound++;
                const validClickResponse: GameClickOutputDto = {
                    valid: true,
                    differenceNaturalOverlay: foundDifferenceValues.differenceNaturalOverlay,
                    differenceFlashOverlay: foundDifferenceValues.differenceFlashOverlay,
                };
                this.playerGroup.forEachPlayer((p: Player): boolean => {
                    p.differenceManager.removeDifferenceByIndex(foundDifferenceValues.index, false);
                    return false;
                });

                this.foundDifferences.push(foundDifferenceValues.differenceNaturalOverlay);
                OutputFilterGateway.sendClickResponseMessage.toClient(player.client, validClickResponse);
                const json = {
                    playerName: player.name,
                    valid: true,
                    differenceNaturalOverlay: foundDifferenceValues.differenceNaturalOverlay,
                    differenceFlashOverlay: foundDifferenceValues.differenceFlashOverlay,
                };
                OutputFilterGateway.sendOtherClick.broadcast(player.client, json, this.playerGroup.getLobbyId);
                if (this.observerGroup.getLobbyId) OutputFilterGateway.sendOtherClick.broadcast(player.client, json, this.observerGroup.getLobbyId);

                player.differencesFound++;
                OutputFilterGateway.sendCheatIndex.toLobby(this.playerGroup.getLobbyId, foundDifferenceValues.index);

                const differencesLeft = player.differenceManager.originalDifferenceAmount - this.totalDifferencesFound;
                const otherPlayerScores: number[] = [];
                this.playerGroup.forEachPlayer((p) => {
                    if (p.client.id !== player.client.id) otherPlayerScores.push(p.differencesFound);
                    return false;
                });
                const maximum = Math.max(...otherPlayerScores);
                if (maximum + differencesLeft < player.differencesFound) this.endGame(player);
                return true;
            }
            const jsonClick = {
                playerName: player.name,
                valid: false,
            };
            OutputFilterGateway.sendOtherClick.broadcast(player.client, jsonClick, this.playerGroup.getLobbyId);
            OutputFilterGateway.sendOtherClick.broadcast(player.client, jsonClick, this.observerGroup.getLobbyId);
            const invalidClickResponse: GameClickOutputDto = {
                valid: false,
                penaltyTime: oneSecond,
            };
            OutputFilterGateway.sendClickResponseMessage.toClient(player.client, invalidClickResponse);
            player.startPenalty(oneSecond);
            return false;
        });
    }
}
