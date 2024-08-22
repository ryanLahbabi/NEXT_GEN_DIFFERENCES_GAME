import { Error } from '@app/class/error-management/error.constants';
import OutputFilterGateway from '@app/gateways/output-filters.gateway';
import { Channel } from '@app/model/database-schema/channel/channel.schema';
import { ConnectionsService } from '@app/services/authentification/connections.service';
import { ChannelMessageDTO } from '@common/dto/channel/channel-message.dto';
import { ChannelMessageType } from '@common/enums/channel-message-type.enum';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { GLOBAL_CHANNEL_ID } from './channel.constants';

export default class ChannelService {
    private connectedUsers: { [username: string]: Socket } = {};
    private users: string[] = [];
    private id: string;
    private name: string;

    constructor(channelData: Channel, readonly connectionsService: ConnectionsService) {
        this.id = channelData['_id']?.toHexString() || GLOBAL_CHANNEL_ID;
        this.users = channelData.members;
        this.name = channelData.name;
    }

    get getName(): string {
        return this.name;
    }

    get getUserNbr(): number {
        return Object.keys(this.users).length;
    }

    get getConnectedUserNbr(): number {
        return Object.keys(this.connectedUsers).length;
    }

    get getId(): string {
        return this.id;
    }

    get hostName() {
        return this.users[0];
    }

    hasJoined(username: string): boolean {
        return this.id === GLOBAL_CHANNEL_ID || this.users.includes(username);
    }

    async reconnect(username: string): Promise<boolean> {
        try {
            Error.Chan.USER_NOT_IN_CHANNEL.generateErrorIf(!this.hasJoined(username)).formatMessage(username, this.id);
            // Logger.debug(`Reconnecting user ${username} to channel ${this.name}   (${this.id}).`);
            const client = this.connectionsService.getUserData(username).socket;
            this.connectedUsers[username] = client;
            await client.join(this.id);
            return true;
        } catch (e) {
            Logger.error(e);
            return false;
        }
    }

    async disconnect(username: string) {
        // Logger.debug(`Disconnecting user ${username} from channel ${this.name}   (${this.id}).`);
        delete this.connectedUsers[username];
    }

    async join(username: string) {
        Error.Chan.USER_ALREADY_IN_CHANNEL.generateErrorIf(this.hasJoined(username)).formatMessage(username, this.id);

        const client = this.connectionsService.getUserData(username).socket;
        await client.join(this.id);
        this.users.push(username);
        this.connectedUsers[username] = client;
    }

    async leave(username: string) {
        Error.Chan.USER_NOT_IN_CHANNEL.generateErrorIf(!this.hasJoined(username)).formatMessage(username, this.id);

        await this.connectedUsers[username].leave(this.id);
        this.users = this.users.filter((u) => u !== username);
        delete this.connectedUsers[username];
    }

    updateUsername(presentUsername: string, newUsername: string) {
        const isAMember = this.users.includes(presentUsername);
        if (isAMember) {
            this.users = this.users.filter((u) => u !== presentUsername).concat([newUsername]);
            const user = this.connectedUsers[presentUsername];
            if (user) {
                this.connectedUsers[newUsername] = user;
                delete this.connectedUsers[presentUsername];
            }
        }
    }

    // eslint-disable-next-line max-params
    sendMessage(username: string, message: string, isAGif: boolean, timestamp: number) {
        Error.Chan.USER_NOT_IN_CHANNEL.generateErrorIf(!this.hasJoined(username)).formatMessage(username, this.id);
        const userData = this.connectionsService.getUserData(username);

        const chatMessage: ChannelMessageDTO = {
            sender: username,
            message,
            avatar: userData.avatar,
            // isAGif,
            timestamp,
            channelId: this.id,
            type: isAGif ? ChannelMessageType.GifUri : ChannelMessageType.UserMessage,
        };
        if (userData.blockedUsers.length === 0) {
            OutputFilterGateway.sendChatMessage.toLobby(this.id, chatMessage);
        } else {
            for (const [user, socket] of Object.entries(this.connectedUsers)) {
                if (!userData.blockedUsers.includes(user)) {
                    OutputFilterGateway.sendChatMessage.toClient(socket, chatMessage);
                }
            }
        }
    }
}
