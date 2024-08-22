import * as BadWords from '@app/../assets/nono-words.json';
import { Error } from '@app/class/error-management/error.constants';
import OutputFilterGateway from '@app/gateways/output-filters.gateway';
import { ChannelDocument } from '@app/model/database-schema/channel/channel.schema';
import { ConnectionsService } from '@app/services/authentification/connections.service';
import { ChannelMessageDTO } from '@common/dto/channel/channel-message.dto';
import { ChannelUpdateDTO } from '@common/dto/channel/channel-update.dto';
import { ChannelMessageType } from '@common/enums/channel-message-type.enum';
import { ChannelUpdateType } from '@common/enums/channel/channel-update-type.enum';
import { GlobalActionType } from '@common/enums/channel/global-action-type.enum';
import { Language } from '@common/enums/user/language.enum';
import { TranslatedAction } from '@common/types/translated-action.type';
import { Injectable, Logger } from '@nestjs/common';
import { GLOBAL_ACTION_MESSAGES, GLOBAL_CHANNEL_ID } from './channel.constants';
import ChannelDBService from './channel.db.service';
import ChannelService from './channel.service';

@Injectable({ durable: true })
export default class ChannelManagerService {
    private readonly channels: { [id: string]: ChannelService } = {};
    private globalRoom: ChannelService;

    constructor(readonly channelDBService: ChannelDBService, readonly connectionsService: ConnectionsService) {
        this.globalRoom = new ChannelService({ name: 'General Chat', members: [] } as ChannelDocument, connectionsService);
        channelDBService.getAllChannels().then((channels) => {
            channels.forEach((channelData) => {
                Logger.debug(`Starting channel ${channelData.name}   (${channelData['_id']})`);
                const channel = new ChannelService(channelData, connectionsService);
                this.channels[channel.getId] = channel;
            });
        });
    }

    static sendGlobalAction(globalAction: GlobalActionType, ...args: string[]) {
        const messages = GLOBAL_ACTION_MESSAGES[globalAction];
        const messageVariant = messages[Math.floor(Math.random() * messages.length)];
        const updatedMessage: TranslatedAction = {
            [Language.English]: undefined,
            [Language.French]: undefined,
        };
        [Language.English, Language.French].forEach((lang: Language) => {
            updatedMessage[lang] = messageVariant[lang](...args);
        });
        const channelMessage: ChannelMessageDTO = {
            channelId: GLOBAL_CHANNEL_ID,
            timestamp: Date.now(),
            type: ChannelMessageType.GlobalAction,
            getGlobalMessage: updatedMessage,
        };
        OutputFilterGateway.sendChatMessage.toServer(channelMessage);
    }

    static shouldCensorMessage(message: string) {
        const words = message.split(' ');
        const badWords = BadWords['en'].concat(BadWords['fr']);
        for (const w of badWords)
            if (words.includes(w)) {
                return true;
            }
        return false;
    }

    reconnectUser(username: string, channelIds: string[]) {
        this.globalRoom.reconnect(username);
        channelIds.forEach((id) => {
            const channel = this.channels[id];
            if (!channel) {
                this.channelDBService.removeMemberFromChannel(username, id);
                Logger.error(`Channel '${id}' not found, removing it from user '${username}'s channel list.`);
            } else {
                if (!channel.reconnect(username)) this.channelDBService.removeMemberFromChannel(username, id);
            }
        });
    }

    disconnect(username: string) {
        this.globalRoom.disconnect(username);
        Object.values(this.channels).forEach(async (c) => c.disconnect(username));
    }

    async createChannel(channelName: string, username: string): Promise<string> {
        const channelData = await this.channelDBService.createChannel(channelName, username);
        const channel = new ChannelService(channelData, this.connectionsService);
        channel.reconnect(username);
        OutputFilterGateway.sendChannelUpdate.toServer({
            type: ChannelUpdateType.CREATE,
            channelData: [
                {
                    id: channel.getId,
                    name: channel.getName,
                    members: channelData.members,
                    host: channelData.members[0],
                },
            ],
        });
        this.channels[channel.getId] = channel;
        return channel.getId;
    }

    async deleteChannel(channelId: string, username: string) {
        Error.Chan.CANNOT_DELETE_GLOBAL_CHANNEL.generateErrorIf(channelId === GLOBAL_CHANNEL_ID).formatMessage(GLOBAL_CHANNEL_ID);
        Error.Chan.CHANNEL_NOT_FOUND.generateErrorIf(!this.channels[channelId]).formatMessage(channelId);
        Error.Chan.CANNOT_DELETE_CHANNEL.generateErrorIf(username !== this.channels[channelId].hostName).formatMessage(username, channelId);

        await this.channelDBService.deleteChannel(channelId);
        OutputFilterGateway.sendChannelUpdate.toServer({
            type: ChannelUpdateType.DELETE,
            channelData: [
                {
                    id: channelId,
                },
            ],
        });
        delete this.channels[channelId];
    }

    async joinChannel(username: string, channelId: string) {
        const channel = this.channels[channelId];
        Error.Chan.CHANNEL_NOT_FOUND.generateErrorIf(!channel).formatMessage(channelId);

        await channel.join(username);
        await this.channelDBService.addMemberToChannel(username, channelId);
    }

    async leaveChannel(channelId: string, username: string) {
        const channel = this.channels[channelId];
        const presentHost = channel.hostName;
        Error.Chan.CHANNEL_NOT_FOUND.generateErrorIf(!channel).formatMessage(channelId);

        await this.channelDBService.removeMemberFromChannel(username, channelId);
        await channel.leave(username);
        if (channel.getUserNbr === 0) {
            Logger.debug(`Deleting channel '${channel.getName} (id: ${channel.getId}) since the last user left it.`);
            await this.channelDBService.deleteChannel(channelId);
            const channelUpdate: ChannelUpdateDTO = {
                type: ChannelUpdateType.DELETE,
                channelData: [{ id: channel.getId }],
            };
            OutputFilterGateway.sendChannelUpdate.toServer(channelUpdate);
        } else if (channel.hostName !== presentHost) {
            const channelUpdate: ChannelUpdateDTO = {
                type: ChannelUpdateType.INFO,
                channelData: [{ id: channel.getId, host: channel.hostName }],
            };
            OutputFilterGateway.sendChannelUpdate.toServer(channelUpdate);
        }
    }

    // eslint-disable-next-line max-params
    sendMessageToChannel(channelId: string, username: string, message: string, isAGIF: boolean, timestamp: number) {
        if (ChannelManagerService.shouldCensorMessage(message)) return;
        if (channelId === GLOBAL_CHANNEL_ID) {
            this.globalRoom.sendMessage(username, message, isAGIF, timestamp);
            return;
        }
        const channel = this.channels[channelId];
        Error.Chan.CHANNEL_NOT_FOUND.generateErrorIf(!channel).formatMessage(channelId);
        Error.Chan.USER_NOT_IN_CHANNEL.generateErrorIf(!channel.hasJoined(username)).formatMessage(username, channelId);
        channel.sendMessage(username, message, isAGIF, timestamp);
    }

    async updateUsername(presentUsername: string, newUsername: string) {
        await this.channelDBService.updateUsername(presentUsername, newUsername);
        Object.values(this.channels).forEach((c) => c.updateUsername(presentUsername, newUsername));
    }
}
