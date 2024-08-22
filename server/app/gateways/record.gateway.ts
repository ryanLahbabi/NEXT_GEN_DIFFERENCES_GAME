import GameAuthorityService from '@app/services/game-authority/game-authority.service';
import MongoDBService from '@app/services/mongodb/mongodb.service';
import * as Events from '@common/socket-event-constants';
import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GATEWAY_PORT } from './game.gateway.constants';
import OutputFilterGateway from './output-filters.gateway';

@WebSocketGateway(GATEWAY_PORT)
export default class RecordGateway {
    @WebSocketServer() server: Server;

    constructor(private mongoDBService: MongoDBService) {
        GameAuthorityService.mongoDBService = this.mongoDBService;
    }

    @SubscribeMessage(Events.ToServer.GET_ALL_RECORDS)
    async sendAllRecords(client: Socket) {
        try {
            const records = await this.mongoDBService.getAllRecords();
            OutputFilterGateway.sendAllRecords.toClient(client, records);
        } catch (e) {
            Logger.error(e);
        }
    }

    @SubscribeMessage(Events.ToServer.DELETE_ALL_RECORDS)
    async deleteAllRecords() {
        try {
            await this.mongoDBService.removeAllRecords();
        } catch (e) {
            Logger.error(e);
        }
    }
}
