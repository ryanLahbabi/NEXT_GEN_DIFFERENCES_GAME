import * as Events from '@common/socket-event-constants';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import EmissionFilter from './emission-filter';

namespace ServerSpy {
    export const emit = jest.fn();
    export const to = jest.fn(() => ({
        emit,
    }));
}

namespace SocketSpy {
    export const leave = jest.fn();
    export const join = jest.fn();
    export const emit = jest.fn();
    export const to = jest.fn(() => ({
        emit,
    }));
}

jest.mock('./output-filters.gateway');

describe('emission-filter', () => {
    const message = 'message';
    const lobbyId = 'lobbyId';
    let client: Socket;
    const errorLog = jest.fn();
    let event: Events.Event<string>;
    let emissionFilter: EmissionFilter<string>;

    beforeAll(() => {
        jest.spyOn(Socket.prototype, 'emit').mockImplementation(SocketSpy.emit);
        jest.spyOn(Socket.prototype, 'join').mockImplementation(SocketSpy.join);
        jest.spyOn(Socket.prototype, 'leave').mockImplementation(SocketSpy.leave);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn(Socket.prototype, 'to').mockImplementation(SocketSpy.to as any);
        jest.spyOn(Server.prototype, 'emit').mockImplementation(ServerSpy.emit);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        jest.spyOn(Server.prototype, 'to').mockImplementation(ServerSpy.to as any);
    });

    beforeEach(() => {
        errorLog.mockRestore();
        Logger.error = errorLog;
        jest.clearAllMocks();
        EmissionFilter.server = {
            emit: ServerSpy.emit,
            to: ServerSpy.to,
        } as unknown as Server;
        client = Socket.prototype;
        event = new Events.Event<string>('event');
        emissionFilter = new EmissionFilter(event);
    });

    describe('toLobby', () => {
        it('should emit a message to a lobby', () => {
            emissionFilter.toLobby(lobbyId, message);
            expect(ServerSpy.to).toBeCalledWith('lobbyId');
            expect(ServerSpy.emit).toBeCalledWith(event.name, message);
        });

        it('should log an error message if an error occurred', () => {
            ServerSpy.to.mockImplementation(() => undefined);
            emissionFilter.toLobby(lobbyId, message);
            expect(ServerSpy.to).toHaveBeenCalled();
        });
    });

    describe('toClient', () => {
        it('should emit a message to a client', () => {
            emissionFilter.toClient(client, message);
            expect(SocketSpy.emit).toBeCalledWith(event.name, message);
        });

        it('should log an error message if an error occurred', () => {
            client = undefined;
            emissionFilter.toClient(client, message);
            expect(errorLog).toHaveBeenCalled();
        });
    });

    describe('toServer', () => {
        it('should emit a message to the server', () => {
            emissionFilter.toServer(message);
            expect(ServerSpy.emit).toBeCalledWith(event.name, message);
        });

        it('should log an error message if an error occurred', () => {
            EmissionFilter.server = undefined;
            emissionFilter.toServer(message);
            expect(errorLog).toHaveBeenCalled();
        });
    });

    describe('broadcast', () => {
        it('should broadcast a message to the server', () => {
            emissionFilter.broadcast(client, message);
            expect(SocketSpy.emit).toBeCalledWith(event.name, message);
        });

        it('should broadcast a message to a lobby', () => {
            emissionFilter.broadcast(client, message, lobbyId);
            expect(SocketSpy.to).toBeCalledWith(lobbyId);
            expect(SocketSpy.emit).toBeCalledWith(event.name, message);
        });

        it('should log an error message if an error occurred', () => {
            client = undefined;
            emissionFilter.broadcast(client, message, lobbyId);
            expect(errorLog).toHaveBeenCalled();
        });
    });
});
