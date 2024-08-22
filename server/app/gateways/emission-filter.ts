import * as Events from '@common/socket-event-constants';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export default class EmissionFilter<EventType> {
    static server: Server;

    constructor(private readonly event: Events.Event<EventType>) {}

    toLobby(lobbyId: string, message: EventType) {
        try {
            const lobby = EmissionFilter.server.to(lobbyId);
            lobby.emit(this.event.name, message);
        } catch (e) {
            Logger.error('Failed sending message to lobby: ' + lobbyId);
        }
    }

    toClient(client: Socket, message: EventType) {
        try {
            client.emit(this.event.name, message);
        } catch (e) {
            Logger.error(`Failed sending message to client: ${e.message}`);
        }
    }

    toServer(message: EventType) {
        try {
            EmissionFilter.server.emit(this.event.name, message);
        } catch (e) {
            Logger.error('Failed sending message to server');
        }
    }

    broadcast(client: Socket, message: EventType, lobbyId?: string) {
        try {
            if (lobbyId) client.to(lobbyId).emit(this.event.name, message);
            else client.emit(this.event.name, message);
        } catch (e) {
            Logger.error('Failed sending message to server');
        }
    }
}
