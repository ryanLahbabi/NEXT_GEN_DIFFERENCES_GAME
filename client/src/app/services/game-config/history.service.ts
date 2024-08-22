import { Injectable } from '@angular/core';
import { HOUR_INDEX } from '@app/constants/time-constants';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { GameMode } from '@common/enums/game-play/game-mode';
import { History } from '@common/interfaces/records/history';
import { Record } from '@common/interfaces/records/record';
import { FromServer, ToServer } from '@common/socket-event-constants';
import { format } from 'date-fns';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    gamesHistory: History[] = [];

    constructor(private readonly socketService: SocketClientService) {}

    recordToHistory(record: Record): History {
        const gameTime = record.startDate.substring(0, record.startDate.indexOf('GMT'));

        return {
            beginning: format(new Date(record.startDate), 'dd/MM/yyyy') + ' - ' + gameTime.substring(HOUR_INDEX),

            duration: record.duration,
            gameMode: this.getGameModeString(record.gameMode),
            player1: record.players[0].name,
            winner1: record.players[0].winner,
            deserter1: record.players[0].deserter,
            player2: record.players[1]?.name,
            winner2: record.players[1]?.winner,
            deserter2: record.players[1]?.deserter,
        };
    }

    init() {
        this.socketService.on(FromServer.ALL_RECORDS, (records: Record[]) => {
            for (const record of records) this.gamesHistory.unshift(this.recordToHistory(record));
        });
        this.socketService.send(ToServer.GET_ALL_RECORDS);
        this.socketService.on(FromServer.SPREAD_HISTORY, (record: Record) => this.gamesHistory.unshift(this.recordToHistory(record)));
    }

    resetHistory() {
        this.socketService.send(ToServer.DELETE_ALL_RECORDS);
        this.gamesHistory = [];
    }

    getGameModeString(gameMode: GameMode): string {
        switch (gameMode) {
            case GameMode.Classic1v1:
                return 'Classique 1v1';
            case GameMode.ClassicSolo:
                return 'Classique Solo';
            case GameMode.LimitedTimeCoop:
                return 'Tps Limité Coop';
            case GameMode.LimitedTimeSolo:
                return 'Tps Limité Solo';
            default:
                return 'NaN';
        }
    }
}
