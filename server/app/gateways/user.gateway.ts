import { Error as Errors } from '@app/class/error-management/error.constants';
import { jwtConstants } from '@app/guards/auth.constants';
import { AuthGuard } from '@app/guards/auth.guard';
import { ConnectionsService } from '@app/services/authentification/connections.service';
import ChannelManagerService from '@app/services/chat/channel-manager.service';
import UserDBService from '@app/services/user/user.db.service';
import { FriendRequestResponseDTO } from '@common/dto/user/friend-request-response.dto';
import * as Events from '@common/socket-event-constants';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import * as io from 'socket.io';
import { GATEWAY_PORT } from './game.gateway.constants';
import OutputFilterGateway from './output-filters.gateway';

@WebSocketGateway(GATEWAY_PORT)
@UseGuards(AuthGuard)
export default class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: io.Server;
    tokenBlackList: string[] = [];

    // eslint-disable-next-line max-params
    constructor(
        private userDBService: UserDBService,
        private jwtService: JwtService,
        private connectionsService: ConnectionsService,
        private channelManager: ChannelManagerService,
        private connections: ConnectionsService,
    ) {}

    @SubscribeMessage(Events.ToServer.START_FRIEND_REQUEST)
    async startFriendRequest(@MessageBody('username') username: string, @MessageBody('body') potentialFriend: string) {
        try {
            const potentialFriendClient = this.connectionsService.getUserData(potentialFriend)?.socket;
            await this.userDBService.createFriendRequest(username, potentialFriend);
            if (potentialFriendClient) OutputFilterGateway.startFriendRequest.toClient(potentialFriendClient, username);
        } catch (e) {
            Logger.error(e);
        }
    }

    @SubscribeMessage(Events.ToServer.END_FRIEND_REQUEST)
    async endFriendRequest(
        @ConnectedSocket() client: io.Socket,
        @MessageBody('username') username: string,
        @MessageBody('body') body: FriendRequestResponseDTO,
    ) {
        try {
            const newFriendClient = this.connectionsService.getUserData(body.username)?.socket;
            if (body.accepted) {
                await this.userDBService.acceptFriendRequest(username, body.username);

                OutputFilterGateway.endFriendRequest.toClient(client, {
                    username,
                    accepted: true,
                });
                if (newFriendClient) {
                    OutputFilterGateway.endFriendRequest.toClient(newFriendClient, {
                        username,
                        accepted: true,
                    });
                }
            } else {
                await this.userDBService.rejectFriendRequest(username, body.username);
                if (newFriendClient) {
                    OutputFilterGateway.endFriendRequest.toClient(newFriendClient, {
                        username,
                        accepted: false,
                    });
                }
            }
        } catch (e) {
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
            Logger.error(e);
        }
    }

    @SubscribeMessage(Events.ToServer.REMOVE_FRIEND)
    async removeFriend(@MessageBody('username') username: string, @MessageBody('body') friendToRemove: string) {
        try {
            await this.userDBService.removeFriend(username, friendToRemove);
        } catch (e) {
            Logger.error(e);
        }
    }

    @SubscribeMessage(Events.ToServer.SHOW_PENDING_FRIEND_REQUEST)
    async showPendingFriendRequest(@ConnectedSocket() client: io.Socket, @MessageBody('username') username: string) {
        try {
            const pendingFriendRequestsList = await this.userDBService.showPendingFriendRequest(username);
            OutputFilterGateway.showFriendPendingRequest.toClient(client, pendingFriendRequestsList);
        } catch (e) {
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
            Logger.error(e);
        }
    }

    @SubscribeMessage(Events.ToServer.USERS_DATA)
    async getAllUsersPublicData(@ConnectedSocket() client: io.Socket) {
        try {
            const users = await this.userDBService.getAllUsers();
            OutputFilterGateway.userData.toClient(client, users);
        } catch (e) {
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
            Logger.error(e);
        }
    }

    @SubscribeMessage(Events.ToServer.BLOCK_USER)
    async blockUser(@MessageBody('username') username: string, @MessageBody('body') blockedUser: string) {
        try {
            const potentialBlockedUser = this.connectionsService.getUserData(blockedUser)?.socket;
            OutputFilterGateway.blockUser.toClient(potentialBlockedUser, username);
        } catch (e) {
            Logger.error(e);
        }
    }

    @SubscribeMessage(Events.ToServer.UNBLOCK_USER)
    async unblockUser(@MessageBody('username') username: string, @MessageBody('body') unblockedUser: string) {
        try {
            const potentialUnblockedUser = this.connectionsService.getUserData(unblockedUser)?.socket;
            OutputFilterGateway.unblockUser.toClient(potentialUnblockedUser, username);
        } catch (e) {
            Logger.error(e);
        }
    }

    async handleConnection(@ConnectedSocket() client: io.Socket) {
        let username = 'unknown user';
        try {
            let token: string;
            try {
                token = client.handshake.headers?.authorization?.split(' ')[1];
                if (!token) token = client.handshake.auth.authorization.split(' ')[1];
            } catch {
                throw new Error('Token was wrongly formatted in the <auth>.');
            }
            Errors.Auth.UNDEFINED_TOKEN.generateErrorIf(!token).formatMessage();
            Errors.Auth.INVALID_TOKEN.generateErrorIf(this.connectionsService.isBlackListedToken(token)).formatMessage();

            const payload = await this.jwtService.verifyAsync(token, { secret: jwtConstants.secret });
            username = payload.sub;

            if (this.connectionsService.connect(username, token, client, []) && client.connected) {
                client.data['username'] = username;
                const userData = await this.userDBService.getUserByName(username);
                const data = this.connectionsService.getUserData(username);
                const channelIds: string[] = [];
                this.connectionsService.updateAvatar(username, userData.avatar);
                data.blockedUsers = userData.blockRelations;
                userData.channels.forEach((c) => channelIds.push(c.toString()));
                this.channelManager.reconnectUser(username, channelIds);
                OutputFilterGateway.sendStartAppSignal.toClient(client, {
                    username: userData.username,
                    email: userData.email,
                    avatar: userData.avatar,
                    biography: userData.biography,
                    friends: userData.friends,
                    success: userData.success,
                    failure: userData.failure,
                    generalGameStatistics: userData.generalGameStatistics,
                    hasBlocked: userData.hasBlocked,
                    blockRelations: userData.blockRelations,
                    pendingFriendRequests: userData.pendingFriendRequests,
                    interfacePreference: userData.interfacePreference,
                    channels: userData.channels.map((c) => c.toHexString()),
                    elo: userData.elo,
                    likedCards: userData.likedCards,
                    dislikedCards: userData.dislikedCards,
                });
                Logger.log(`User '${username}' is connected by  WebSocket.`);
            } else throw new Error(`User named '${username}' is already connected on another device.`);
        } catch (error) {
            OutputFilterGateway.sendToErrorChannel.toClient(client, error);
            switch (error.code) {
                case Errors.Auth.INVALID_TOKEN.code:
                case Errors.User.USER_NOT_FOUND.code:
                    this.connectionsService.blackListUserToken(username);
                    break;
            }
            client.disconnect();
            Logger.error(`Error handling WS connection: ${error.message}`);
        }
    }

    async handleDisconnect(@ConnectedSocket() client: io.Socket, username: string = client.data.username) {
        if (this.connectionsService.isConnected(username)) {
            this.channelManager.disconnect(username);
            this.connectionsService.disconnect(username);
            Logger.log(`User '${username}' has disconnected from the WS handshake.`);
        } else Logger.warn('Unauthorized user tried to log-in.');
    }
}
