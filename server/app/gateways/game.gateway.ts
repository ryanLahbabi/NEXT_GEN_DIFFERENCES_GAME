import { Error } from '@app/class/error-management/error.constants';
import ClassicDeathMatch from '@app/class/game-logic/classic-death-match/classic-death-match';
import LimitedTimeDeathMatch from '@app/class/game-logic/limited-time-death-match/limited-time-death-match';
import { AuthGuard } from '@app/guards/auth.guard';
import { GameClickFilter } from '@app/model/gateway-dto/game/game-click.dto';
import { GameConnectionRequestFilter } from '@app/model/gateway-dto/game/game-connection-request.dto';
import { GameValuesInputFilter } from '@app/model/gateway-dto/game/game-values.dto';
import { ConnectionsService } from '@app/services/authentification/connections.service';
import ChannelManagerService from '@app/services/chat/channel-manager.service';
import GameAuthorityService from '@app/services/game-authority/game-authority.service';
import MongoDBService from '@app/services/mongodb/mongodb.service';
import { ChannelMessageDTO } from '@common/dto/channel/channel-message.dto';
import { ObserverHelpDTO } from '@common/dto/game/observer-help.dto';
import { SoundBoardDTO } from '@common/dto/game/soundboard.dto';
import { StartGameDTO } from '@common/dto/game/start-game.dto';
import { UpdateGameAccess } from '@common/dto/game/update-game-access.dto';
import { ChannelMessageType } from '@common/enums/channel-message-type.enum';
import { GameMode } from '@common/enums/game-play/game-mode';
import { ObserverState } from '@common/enums/game-play/observer-state.enum';
import * as Events from '@common/socket-event-constants';
import { Body, Logger, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GATEWAY_PORT, GameConnectionData } from './game.gateway.constants';
import OutputFilterGateway from './output-filters.gateway';

@WebSocketGateway(GATEWAY_PORT)
@UseGuards(AuthGuard)
export default class GameGateway implements OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(private mongoDBService: MongoDBService, private connectionsService: ConnectionsService) {
        GameAuthorityService.mongoDBService = this.mongoDBService;
    }

    @SubscribeMessage(Events.ToServer.IS_PLAYING)
    isPlaying(@ConnectedSocket() client: Socket) {
        try {
            const result = GameAuthorityService.getOngoingGames.findGameByPlayerId(client.id) !== undefined;
            OutputFilterGateway.sendPlayerStatus.toClient(client, result);
        } catch (e) {
            Logger.error(e);
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
        }
    }

    /**
     * Verifies the identity of the client , then verifies if his click hit a difference or not and
     * finally informs him and everyone in his game of the result.
     *
     * @param client - The socket of the client who sent the event
     * @param input - The coordinates of the click on the game canvas by the client
     */
    @SubscribeMessage(Events.ToServer.CLICK)
    verifyClick(@ConnectedSocket() client: Socket, @MessageBody('body') body: GameClickFilter) {
        try {
            const game = GameAuthorityService.getOngoingGames.findGame(body.gameId);
            Error.Game.GAME_NOT_FOUND.generateErrorIf(!game).formatMessage(body.gameId);
            const player = game.findPlayer(client.id);
            Error.Game.PLAYER_NOT_IN_GAME.generateErrorIf(!player).formatMessage(client.id, game.getId);
            Error.Game.CURRENT_DOWNTIME.generateErrorIf(player.downTime).formatMessage(client.id);
            game.verifyClick(client.id, { x: body.x, y: body.y });
        } catch (e) {
            Logger.error(e);
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
        }
    }

    /**
     * Verifies the identity of the client, than sends the message to the other players in his game.
     *
     * @param client - The socket of the client who sent the event
     * @param input - the message sent by the client to the other players in his game
     */
    @SubscribeMessage(Events.ToServer.GAME_CHAT_MESSAGE)
    sendChatMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody('username') username: string,
        @MessageBody('body') body: { gameId: string; message: string; isAGif: boolean; timestamp: number },
    ) {
        try {
            let game = GameAuthorityService.getOngoingGames.findGame(body.gameId);
            if (!game) game = GameAuthorityService.getPendingGames.findGame(body.gameId);
            let player = game?.findPlayer(client.id);
            if (!player) player = game?.observerGroupPlayers.getPlayer(client.id);
            Error.Game.GAME_NOT_FOUND.generateErrorIf(!game).formatMessage(body.gameId);
            Error.Game.PLAYER_NOT_IN_GAME.generateErrorIf(!player).formatMessage(client.id, game.getId);
            if (ChannelManagerService.shouldCensorMessage(body.message)) return;
            const chatMessage: ChannelMessageDTO = {
                sender: username,
                message: body.message,
                avatar: this.connectionsService.getAvatar(username),
                timestamp: body.timestamp,
                channelId: 'gaming',
                type: body.isAGif ? ChannelMessageType.GifUri : ChannelMessageType.UserMessage,
            };
            for (const lobbyId of game.getLobbyIds()) OutputFilterGateway.sendChatMessage.toLobby(lobbyId, chatMessage);
            OutputFilterGateway.sendChatMessage.toLobby(game.observerGroupPlayers.getLobbyId, chatMessage);
        } catch (e) {
            Logger.error(e);
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
        }
    }

    /**
     * Parses the data sent by the client to a minimalist format and attempts to connect him to a
     * game.
     *
     * @param client - The socket of the client who sent the event
     * @param input - The necessary information for the client to connect to a game
     */
    @SubscribeMessage(Events.ToServer.REQUEST_TO_PLAY)
    async joinGame(@ConnectedSocket() client: Socket, @MessageBody('username') username: string, @Body('body') body: GameConnectionRequestFilter) {
        try {
            Logger.log('Attempting to connect client: ' + client.id);
            const avatar = this.connectionsService.getAvatar(username);
            const data: GameConnectionData = {
                gameMode: body['gameMode'],
                cardId: body['cardId'],
                gameId: body['gameId'],
                playersWithAccess: body.playersWithAccess,
                user: {
                    name: username,
                    client,
                    avatar,
                },
            };

            await GameAuthorityService.connect(data);
        } catch (e) {
            Logger.error(e);
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
        }
    }

    @SubscribeMessage(Events.ToServer.JOIN_OBSERVER)
    async joinGameObserver(@ConnectedSocket() client: Socket, @MessageBody('username') username: string, @Body('body') id: string) {
        try {
            Logger.debug('Attempting to connect observer to game: ' + id);
            const game = GameAuthorityService.getOngoingGames.findGame(id);
            const avatar = this.connectionsService.getAvatar(username);
            Error.Game.GAME_NOT_FOUND.generateErrorIf(game === undefined).formatMessage(id);
            const hasJoined = game.join({
                name: username,
                client,
                avatar,
            });
            if (hasJoined) game.updateObserver(client, []);
        } catch (e) {
            Logger.error(e);
            OutputFilterGateway.sendJoinObserverInfo.toClient(client, {
                state: ObserverState.CannotWatch,
            });
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
        }
    }

    /**
     * Verifies the identity of the client, than kicks a player from a waiting lobby or makes him
     * join a game depending on the host's decision
     *
     * @param client - The socket of the client who sent the event
     * @param input - The necessary information to accept or reject a player from a game
     */
    // @SubscribeMessage(Events.ToServer.PLAYER_VALIDATION)
    // async validatePlayer(@ConnectedSocket() client: Socket, @MessageBody('body') body: PlayerValidationDto) {
    //     try {
    //         const game = GameAuthorityService.getPendingGames.findGame(body.gameId);
    //         Error.Game.GAME_NOT_FOUND.generateErrorIf(!game).formatMessage(body.gameId);
    //         Error.Game.WRONG_GAMEMODE.generateErrorIf(game.getGameMode !== GameMode.Classic1v1).formatMessage(
    //             GameMode[game.getGameMode],
    //             GameMode[GameMode.Classic1v1],
    //         );
    //         Error.Game.UNAUTHORIZED_ACTION.generateErrorIf(game.host?.client.id !== client.id).formatMessage(client.id);

    //         if (!body.canJoin) (game as Classic1v1).kickWaitingPlayer(body.playerId);
    //         else game.startGame(body.playerId);
    //     } catch (e) {
    //         Logger.error(e);
    //         OutputFilterGateway.sendToErrorChannel.toClient(client, e);
    //     }
    // }

    // @SubscribeMessage(Events.ToServer.REQUEST_ACCESS_TYPE)
    // async requestGameAccess(@ConnectedSocket() client: Socket, @MessageBody('body') body: UpdateGameAccess) {
    //     try {
    //         Logger.log("requesting");
    //         OutputFilterGateway.requestAccess.broadcast(client, Events.FromServer.REQUEST_ACCESS_TYPE);
    //     } catch (e) {
    //         Logger.error(e);
    //         OutputFilterGateway.sendToErrorChannel.toClient(client, e);
    //     }
    // }


    @SubscribeMessage(Events.ToServer.UPDATE_ACCESS_TYPE)
    async updateGameAccess(@ConnectedSocket() client: Socket, @MessageBody('body') body: UpdateGameAccess) {
        try {
            const game = GameAuthorityService.getPendingGames.findGame(body.gameId);
            Error.Game.GAME_NOT_FOUND.generateErrorIf(game === undefined).formatMessage(body.gameId);
            OutputFilterGateway.sendUpdateGameAccessType.toServer(body);
        } catch (e) {
            Logger.error(e);
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
        }
    }


    /**
     * Starts by verifying the identity of the player before sending him the data, then sends him an array
     * with the length of the available differences and the yet to find differences with their appropriate
     * indexes.
     *
     * @param client - The socket of the client who sent the event
     * @param gameId - The id of the game in which the client plays
     */
    @SubscribeMessage(Events.ToServer.CHEAT)
    async sendCheatFlashes(@ConnectedSocket() client: Socket, @MessageBody('body') body: string) {
        try {
            const game = GameAuthorityService.getOngoingGames.findGame(body);
            Error.Game.GAME_NOT_FOUND.generateErrorIf(!game).formatMessage(body);
            const player = game?.findPlayer(client.id);
            Error.Game.PLAYER_NOT_IN_GAME.generateErrorIf(!player).formatMessage(client.id, game.getId);
            if (game.getCanCheat) {
                const flashes = player?.differenceManager?.cheatFlashImages;
                if (flashes) OutputFilterGateway.sendAllCheatFlashImages.toClient(client, flashes);
            }
        } catch (e) {
            Logger.error(e);
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
        }
    }

    @SubscribeMessage(Events.ToServer.OBSERVER_HELP)
    async observerHelp(@ConnectedSocket() client: Socket, @MessageBody('body') observerHelp: ObserverHelpDTO) {
        try {
            const game = GameAuthorityService.getOngoingGames.findGame(observerHelp.gameId);
            Error.Game.GAME_NOT_FOUND.generateErrorIf(!game).formatMessage(observerHelp.gameId);
            game.helpPlayers(client.id, observerHelp.zoneCoordinates, observerHelp.targetPlayerName);
        } catch (e) {
            Logger.error(e);
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
        }
    }

    /**
     * Attempts to remove the client from a game, and thus looks for a corresponding game in the ongoing and
     * pending games list and try's to remove him
     *
     * @param client - The socket of the client who sent the event
     * @param gameId - The id of the game in which the client plays
     */
    @SubscribeMessage(Events.ToServer.LEAVE_GAME)
    async leaveGame(@ConnectedSocket() client: Socket, @Body('body') gameId: string) {
        try {
            const game = GameAuthorityService.getPendingGames.findGame(gameId);
            const removedPlayer = await game?.removePlayer(client.id);
            if (removedPlayer) OutputFilterGateway.sendJoinableGames.toServer(GameAuthorityService.joinableGames);
            if (!removedPlayer) await GameAuthorityService.getOngoingGames.findGame(gameId)?.removePlayer(client.id);
        } catch (e) {
            Logger.error(e);
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
        }
    }

    @SubscribeMessage(Events.ToServer.SET_GAME_VALUES)
    async setGameValues(@ConnectedSocket() client: Socket, @MessageBody('body') body: GameValuesInputFilter) {
        try {
            if (body.gainedTime !== undefined) GameAuthorityService.gameValues.gainedTime = body.gainedTime;
            if (body.penaltyTime !== undefined) GameAuthorityService.gameValues.penaltyTime = body.penaltyTime;
            if (body.timerTime !== undefined) GameAuthorityService.gameValues.timerTime = body.timerTime;
        } catch (e) {
            Logger.error(e);
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
        }
    }

    @SubscribeMessage(Events.ToServer.GET_GAME_VALUES)
    async sendGameValues(@ConnectedSocket() client: Socket) {
        try {
            OutputFilterGateway.sendGameValues.toClient(client, GameAuthorityService.gameValues);
        } catch (e) {
            Logger.error(e);
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
        }
    }

    @SubscribeMessage(Events.ToServer.START_GAME)
    async startGame(@ConnectedSocket() client: Socket, @MessageBody('body') body: StartGameDTO) {
        try {
            const game = GameAuthorityService.getPendingGames.findGame(body.gameId);
            Error.Game.GAME_NOT_FOUND.generateErrorIf(!game).formatMessage(body.gameId);
            const badGamemode = game.getGameMode !== GameMode.ClassicDeathMatch && game.getGameMode !== GameMode.LimitedTimeDeathMatch;
            const notTheHost = client.id !== game.host?.client.id;
            if (badGamemode || notTheHost) return;

            switch (game.getGameMode) {
                case GameMode.LimitedTimeDeathMatch:
                    (game as LimitedTimeDeathMatch).setGameValues(
                        {
                            timerTime: body.totalTime,
                            penaltyTime: body.penaltyTime,
                            gainedTime: body.addedTime,
                        },
                        body.canCheat,
                    );
                    break;
                case GameMode.ClassicDeathMatch:
                    (game as ClassicDeathMatch).setGameValues(body.totalTime, body.canCheat);
                    break;
            }
            game.startGame();
            OutputFilterGateway.sendOnGoingGames.toServer(GameAuthorityService.getOngoingGames.getGamesInfos);
        } catch (e) {
            Logger.error(e);
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
        }
    }

    @SubscribeMessage(Events.ToServer.SOUNDBOARD)
    useSoundboard(@ConnectedSocket() client: Socket, @MessageBody('body') soundBoard: SoundBoardDTO) {
        try {
            const game = GameAuthorityService.getOngoingGames.findGame(soundBoard.gameId);
            Error.Game.GAME_NOT_FOUND.generateErrorIf(!game).formatMessage(soundBoard.gameId);
            Error.Game.PLAYER_NOT_IN_GAME.generateErrorIf(!game.findObserver(client.id)).formatMessage(client.id, soundBoard.gameId);
            game.sendSound(soundBoard.sound);
        } catch (e) {
            Logger.error(e);
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
        }
    }

    /**
     * Attempts to find an ongoing game with the corresponding Id and sends the client a hint if he is
     * in the game
     *
     * @param client - The socket of the client who sent the event
     * @param gameId - The id of the game in which the client plays
     */
    // @SubscribeMessage(Events.ToServer.HINT)
    // getHint(@ConnectedSocket() client: Socket, @MessageBody('body') body: string) {
    //     try {
    //         const hint = GameAuthorityService.getOngoingGames.findGame(body)?.getHint(client.id);
    //         if (hint) OutputFilterGateway.sendHint.toClient(client, hint);
    //     } catch (e) {
    //         Logger.error(e);
    //         OutputFilterGateway.sendToErrorChannel.toClient(client, e);
    //     }
    // }

    /**
     * Sends a list of joinable games to the client
     *
     * @param client - The socket of the client who sent the event
     */
    @SubscribeMessage(Events.ToServer.JOINABLE_GAME_CARDS)
    getJoinableGames(@ConnectedSocket() client: Socket) {
        OutputFilterGateway.sendJoinableGames.toClient(client, GameAuthorityService.joinableGames);
    }

    @SubscribeMessage(Events.ToServer.ONGOING_GAMES)
    getOngoingGames(@ConnectedSocket() client: Socket) {
        OutputFilterGateway.sendOnGoingGames.toClient(client, GameAuthorityService.getOngoingGames.getGamesInfos);
    }

    handleDisconnect(client: Socket) {
        GameAuthorityService.removePlayer(client.id);
    }
}
