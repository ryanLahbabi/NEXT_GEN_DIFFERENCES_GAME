import { AuthGuard } from '@app/guards/auth.guard';
import ChannelManagerService from '@app/services/chat/channel-manager.service';
import ChannelDBService from '@app/services/chat/channel.db.service';
import { ChannelUpdateDTO } from '@common/dto/channel/channel-update.dto';
import { ChannelUpdateType } from '@common/enums/channel/channel-update-type.enum';
import * as Events from '@common/socket-event-constants';
import { Logger, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GATEWAY_PORT } from './game.gateway.constants';
import OutputFilterGateway from './output-filters.gateway';

@WebSocketGateway(GATEWAY_PORT)
@UseGuards(AuthGuard)
export default class ChannelGateway {
    constructor(private channelManager: ChannelManagerService, private channelDBService: ChannelDBService) {}

    @SubscribeMessage(Events.ToServer.SEND_CHAT_MESSAGE)
    async sendChatMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody('username') username: string,
        @MessageBody('body') body: { channelId: string; message: string; isAGif: boolean; timestamp: number },
    ) {
        try {
            this.channelManager.sendMessageToChannel(body.channelId, username, body.message, body.isAGif, body.timestamp);
        } catch (e) {
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
            Logger.error(e);
        }
    }

    // Send a list of all channel names/ids
    @SubscribeMessage(Events.ToServer.GET_ALL_CHANNELS)
    async getAllChannels(@ConnectedSocket() client: Socket) {
        try {
            const channelUpdate: ChannelUpdateDTO = {
                type: ChannelUpdateType.INFO,
                channelData: (await this.channelDBService.getAllChannels()).map((c) => ({
                    id: c['_id'].toHexString(),
                    name: c.name,
                    host: c.members[0],
                })),
            };
            OutputFilterGateway.sendChannelUpdate.toClient(client, channelUpdate);
        } catch (e) {
            OutputFilterGateway.sendToErrorChannel.toClient(client, e);
        }
    }
}
