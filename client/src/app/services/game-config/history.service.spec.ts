/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/test-helpers/socket-test-helper';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { GameMode } from '@common/enums/game-play/game-mode';
import { FromServer, ToServer } from '@common/socket-event-constants';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
    let service: HistoryService;
    let socketTestHelper: SocketTestHelper;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
        TestBed.configureTestingModule({
            providers: [HistoryService, { provide: SocketClientService, useValue: socketTestHelper }],
        });
        service = TestBed.inject(HistoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set gamesHistory to an empty array when resetHistory is called', () => {
        spyOn(socketTestHelper, 'send');
        service.gamesHistory = [
            {
                beginning: '15/04/2023',
                duration: { minutes: 3, seconds: 12 },
                gameMode: 'test',
                player1: 'Player 1',
                winner1: true,
                deserter1: false,
            },
        ];

        service.resetHistory();

        expect(service.gamesHistory).toEqual([]);
        expect(socketTestHelper.send).toHaveBeenCalledWith(ToServer.DELETE_ALL_RECORDS);
    });

    it('should return the correct game mode string', () => {
        expect(service.getGameModeString(GameMode.Classic1v1)).toEqual('Classique 1v1');
        expect(service.getGameModeString(GameMode.ClassicSolo)).toEqual('Classique Solo');
        expect(service.getGameModeString(GameMode.LimitedTimeCoop)).toEqual('Tps Limité Coop');
        expect(service.getGameModeString(GameMode.LimitedTimeSolo)).toEqual('Tps Limité Solo');
        expect(service.getGameModeString(42 as GameMode)).toEqual('NaN');
    });

    it('should add a new history record to gamesHistory when history_received event is triggered', () => {
        const record: unknown = {
            startDate: '2023-04-15T12:00:00Z',
            duration: { minutes: 3, seconds: 12 },
            gameMode: GameMode.Classic1v1,
            players: [
                { name: 'Player 1', winner: true, deserter: false },
                { name: 'Player 2', winner: false, deserter: true },
            ],
        } as unknown;

        service.init();
        socketTestHelper.peerSideEmit(FromServer.SPREAD_HISTORY, record);

        expect(service.gamesHistory.length).toEqual(1);
        expect(service.gamesHistory[0]).toEqual({
            beginning: '15/04/2023 - ',
            duration: { minutes: 3, seconds: 12 },
            gameMode: 'Classique 1v1',
            player1: 'Player 1',
            winner1: true,
            deserter1: false,
            player2: 'Player 2',
            winner2: false,
            deserter2: true,
        });
    });
    it('should fill gamesHistory when all_records event is triggered', () => {
        const record: unknown = {
            startDate: '2023-04-15T12:00:00Z',
            duration: { minutes: 3, seconds: 12 },
            gameMode: GameMode.Classic1v1,
            players: [{ name: 'Player 1', winner: true, deserter: false }],
        } as unknown;

        service.init();
        socketTestHelper.peerSideEmit(FromServer.ALL_RECORDS, [record]);

        expect(service.gamesHistory.length).toEqual(1);
    });
});
