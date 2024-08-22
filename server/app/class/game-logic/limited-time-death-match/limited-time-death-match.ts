import DifferenceManager from '@app/class/game-logic/difference-manager/difference-manager';
import LimitedTime from '@app/class/game-logic/game-interfaces/limited-time-interface';
import Player from '@app/class/game-logic/player/player';
import PlayerGroup from '@app/class/player-groups/default-player-group/player-group';
import StopWatch from '@app/class/watch/stopwatch/stopwatch';
import Timer from '@app/class/watch/timer/timer';
import { GameConnectionData, User } from '@app/gateways/game.gateway.constants';
import OutputFilterGateway from '@app/gateways/output-filters.gateway';
import ChannelManagerService from '@app/services/chat/channel-manager.service';
import GameAuthorityService from '@app/services/game-authority/game-authority.service';
import MongoDBService from '@app/services/mongodb/mongodb.service';
import { GlobalActionType } from '@common/enums/channel/global-action-type.enum';
import { GameConnectionAttemptResponseType } from '@common/enums/game-play/game-connection-attempt-response-type';
import { GameMode } from '@common/enums/game-play/game-mode';
import { PlayerConnectionStatus } from '@common/enums/game-play/player-connection-status';
import { GameConnectionRequestOutputMessageDto } from '@common/interfaces/game-play/game-connection-request.dto';
import { EndgameOutputDto } from '@common/interfaces/game-play/game-endgame.dto';
import { GameValues } from '@common/interfaces/game-play/game-values';
import { SimpleUser } from '@common/interfaces/game-play/simple-user';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { MAX_OBSERVER_NBR, MAX_PLAYER_NBR } from './limited-time-death-match.constants';

export default class LimitedTimeDeathMatch extends LimitedTime {
    constructor(mongodbService: MongoDBService) {
        super(mongodbService);
        this.gameMode = GameMode.LimitedTimeDeathMatch;
        this.gameValues = JSON.parse(JSON.stringify(GameAuthorityService.gameValues));
    }

    setGameValues(values: GameValues, canCheat: boolean) {
        this.gameValues = values;
        this.canCheat = canCheat;
    }

    initialize(data: GameConnectionData): boolean {
        this.observerGroup = new PlayerGroup(0, MAX_OBSERVER_NBR);
        this.id = data.user.client.id;
        const maxPlayers = 4;
        const minPlayers = 2;
        this.playerGroup = new PlayerGroup(minPlayers, maxPlayers);
        this.join(data.user);
        GameAuthorityService.getPendingGames.addGame(this);
        this.fetchInitialCards()
            .then(() => {
                this.shiftCards();
                this.differenceManager = new DifferenceManager(this.card, this.cardFiles);
                this.playerGroup.host.differenceManager = this.differenceManager;
            })
            .catch((e) => {
                OutputFilterGateway.sendConnectionAttemptResponseMessage.toClient(data.user.client, {
                    responseType: GameConnectionAttemptResponseType.Cancelled,
                    gameId: this.id,
                } as GameConnectionRequestOutputMessageDto);
                this.endGame();
                Logger.error(e);
            });
        return true;
    }

    startGame() {
        if (!this.playerGroup.isValid) return;
        this.playerGroup.forEachPlayer((player: Player) => {
            player.differenceManager = new DifferenceManager(this.card, this.cardFiles);
            return false;
        });
        GameAuthorityService.startGame(this.id);
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
            playerNbr: this.playerGroup.getPlayerNbr,
            hostName: this.playerGroup.host.name,
            gameValues: this.gameValues,
            canCheat: this.canCheat,
        };
        OutputFilterGateway.sendConnectionAttemptResponseMessage.toLobby(this.playerGroup.getLobbyId, startMessage);
        this.gameWatch = new Timer();
        this.gameTimer = new StopWatch();
        this.gameWatch.eachInterval = () => {
            OutputFilterGateway.sendTime.toLobby(this.playerGroup.getLobbyId, this.gameWatch.getSeconds);
            OutputFilterGateway.sendTime.toLobby(this.observerGroup.getLobbyId, this.gameWatch.getTicks);
        };

        this.gameWatch.onEnd = async () => this.endGame();
        this.gameTimer.start();
        this.gameWatch.set(this.gameValues.timerTime);
        this.gameWatch.start();
        if (this.upcomingCards[0])
            OutputFilterGateway.sendNextCard.toLobby(this.playerGroup.getLobbyId, {
                name: this.upcomingCards[0].data.name,
                originalImage: this.upcomingCards[0].files.originalImage,
                modifiedImage: this.upcomingCards[0].files.modifiedImage,
                nbDifferences: this.upcomingCards[0].data.differenceNbr,
            });
        this.isOngoing = true;
    }

    async endGame() {
        if (this.isOngoing) {
            this.gameWatch.pause();
            this.gameTimer.pause();
            this.isOngoing = false;
            let winners: Player[] = [];
            this.playerGroup.forEachPlayer((p: Player) => {
                if (!winners.length || winners[0].differencesFound < p.differencesFound) winners = [p];
                else if (winners[0].differencesFound === p.differencesFound) winners.push(p);
                return false;
            });
            this.updateElo(winners);
            ChannelManagerService.sendGlobalAction(GlobalActionType.MatchResult, winners.map((w) => w.name).join(' & '));
            const players = this.getPlayerList(winners);
            this.playerGroup.forEachPlayer((p: Player) => {
                const hasWon = players.find((player) => p.name === player.name).winner;
                this.mongodbService.updateGameData(p.name, this.gameMode, this.gameTimer.getTicks, p.differencesFound, hasWon);
                return false;
            });
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
            const cancelMessage = {
                responseType: GameConnectionAttemptResponseType.Cancelled,
                gameId: this.id,
            } as GameConnectionRequestOutputMessageDto;
            OutputFilterGateway.sendConnectionAttemptResponseMessage.toLobby(this.playerGroup.getLobbyId, cancelMessage);
        }
        this.playerGroup.empty();
        this.observerGroup.empty();
    }

    async removePlayer(playerId: string): Promise<boolean> {
        const removedPlayer = this.playerGroup.leave(playerId, this.isOngoing);
        if (removedPlayer) {
            if (this.isOngoing) OutputFilterGateway.sendDeserterMessage.toLobby(this.playerGroup.getLobbyId, removedPlayer.name);
            else {
                GameAuthorityService.joinableGames.forEach((g) => {
                    if (g.id === this.id) {
                        g.waitingPlayers = g.waitingPlayers.filter((n) => n !== removedPlayer.name);
                    }
                });
                if (this.playerGroup.getPlayerNbr === 3) {
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
                        observerNbr: this.observerGroup.getPlayerNbr,
                    });
                }
            }
            OutputFilterGateway.sendPlayerConnectionMessage.toLobby(this.playerGroup.getLobbyId, {
                playerConnectionStatus: PlayerConnectionStatus.Left,
                user: {
                    name: removedPlayer.name,
                    id: removedPlayer.client.id,
                    avatar: undefined,
                },
                playerNbr: this.playerGroup.getPlayerNbr,
            });
        } else if (this.isOngoing) {
            this.observerGroup.leave(playerId, false);
            this.playerGroup.sendMessageToGroup(this.observerGroup.getPlayerNames, OutputFilterGateway.sendObserverList);
            this.observerGroup.sendMessageToGroup(this.observerGroup.getPlayerNames, OutputFilterGateway.sendObserverList);
            OutputFilterGateway.sendOnGoingGames.toServer(GameAuthorityService.getOngoingGames.getGamesInfos);
        }
        if (!this.playerGroup.getPlayerNbr) this.endGame();
        return removedPlayer !== undefined;
    }

    join(user: User): boolean {
        if (this.isOngoing && this.observerGroup) {
            this.observerGroup.joinUser(user, (p) => {
                this.playerGroup.sendMessageToGroup(this.observerGroup.getPlayerNames, OutputFilterGateway.sendObserverList);
                this.observerGroup.sendMessageToGroup(this.observerGroup.getPlayerNames, OutputFilterGateway.sendObserverList);
                OutputFilterGateway.sendOnGoingGames.toServer(GameAuthorityService.getOngoingGames.getGamesInfos);
                p.avatar = user.avatar;
            });
            return true;
        }
        const joined = this.playerGroup.joinUser(user, (p) => {
            p.avatar = user.avatar;
        });
        if (!this.isOngoing && joined) {
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

            if (this.playerGroup.getPlayerNbr === MAX_PLAYER_NBR) {
                GameAuthorityService.joinableGames = GameAuthorityService.joinableGames.filter((g) => g.id !== this.id);
                OutputFilterGateway.sendJoinableGames.toServer(GameAuthorityService.joinableGames);
            }
            return true;
        }
        return false;
    }

    updateObserver(client: Socket) {
        const presentCardFiles = {
            name: this.upcomingCards[0].data.name,
            originalImage: this.upcomingCards[0].files.originalImage,
            modifiedImage: this.upcomingCards[0].files.modifiedImage,
            nbDifferences: this.upcomingCards[0].data.differenceNbr,
            difficulty: this.upcomingCards[0].data.difficulty,
        };
        super.updateObserver(client, [presentCardFiles]);
    }
}
