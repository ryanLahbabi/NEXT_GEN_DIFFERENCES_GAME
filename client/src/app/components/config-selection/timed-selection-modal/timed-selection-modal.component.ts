import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AwaitingPlayersModalComponent } from '@app/components/config-selection/awaiting-players-modal/awaiting-players-modal.component';
import { WarnPlayerModalComponent } from '@app/components/config-selection/warn-player-modal/warn-player-modal.component';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { GameDataService } from '@app/services/game-play/game-data.service';
import { Difficulty } from '@common/enums/game-play/difficulty';
import { GameConnectionAttemptResponseType } from '@common/enums/game-play/game-connection-attempt-response-type';
import { GameMode } from '@common/enums/game-play/game-mode';
import { PlayerConnectionStatus } from '@common/enums/game-play/player-connection-status';
import { SimpleUser } from '@common/interfaces/game-play/simple-user';
import * as Events from '@common/socket-event-constants';

@Component({
    selector: 'app-timed-selection-modal',
    templateUrl: './timed-selection-modal.component.html',
    styleUrls: ['./timed-selection-modal.component.scss'],
})
export class TimedSelectionModalComponent implements OnDestroy {
    waitingPlayers: SimpleUser[] = [];
    playerName: string;
    gameMode: GameMode;
    gameDifficulty: string;
    name2ndPlayer: string;
    canRequest: boolean = true;
    private dataAwaitingPlayers: { gameId: string; waitingPlayers: SimpleUser[]; displayMessage: number } = {
        gameId: '',
        waitingPlayers: this.waitingPlayers,
        displayMessage: 1,
    };
    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<TimedSelectionModalComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { playerName: string },
        private router: Router,
        private dialog: MatDialog,
        private socketService: SocketClientService,
        public gameData: GameDataService,
    ) {
        dialogRef.disableClose = true;
    }
    ngOnDestroy(): void {
        this.socketService.removeListener(Events.FromServer.RESPONSE_TO_JOIN_GAME_REQUEST);
    }

    playSolo() {
        if (this.canRequest) {
            this.canRequest = false;
            this.socketService.send(Events.ToServer.REQUEST_TO_PLAY, {
                gameMode: GameMode.LimitedTimeSolo,
                playerName: this.data.playerName,
            });
            this.socketService.on(Events.FromServer.RESPONSE_TO_JOIN_GAME_REQUEST, this.limitedTimeSingleplayer.bind(this));
        }
    }

    playCoop() {
        if (this.canRequest) {
            this.canRequest = false;
            this.socketService.send(Events.ToServer.REQUEST_TO_PLAY, {
                gameMode: GameMode.LimitedTimeCoop,
                playerName: this.data.playerName,
            });
            this.socketService.on(Events.FromServer.RESPONSE_TO_JOIN_GAME_REQUEST, this.limitedTimeCoopMode.bind(this));
        }
    }
    closeDialog() {
        this.dialogRef.close();
        this.socketService.send(Events.ToServer.LEAVE_GAME, this.dataAwaitingPlayers.gameId);
    }

    private startGame(arg: typeof Events.FromServer.RESPONSE_TO_JOIN_GAME_REQUEST.type) {
        if (arg.difficulty === Difficulty.Easy) this.gameDifficulty = 'facile';
        else if (arg.difficulty === Difficulty.Hard) this.gameDifficulty = 'difficile';
        this.gameData.timeToStart = arg.startingIn;
        this.gameData.modifiedPicture = arg.modifiedImage;
        this.gameData.chronoTime = arg.time;
        this.gameData.gameID = arg.gameId;
        this.gameData.nbOfPlayers = arg.playerNbr;
        this.gameData.originalPicture = arg.originalImage;
        this.gameData.differenceNbr = arg.differenceNbr;
        this.gameData.difficulty = this.gameDifficulty;
        this.gameData.name = this.data.playerName;
        this.gameData.gameName = arg.gameName;
        this.gameData.gameMode = this.gameMode;
        this.gameData.gameValues = arg.gameValues;
        this.router.navigateByUrl('/game');
    }

    private limitedTimeSingleplayer(data: typeof Events.FromServer.RESPONSE_TO_JOIN_GAME_REQUEST.type) {
        this.canRequest = true;
        this.gameMode = GameMode.LimitedTimeSolo;
        switch (data.responseType) {
            case GameConnectionAttemptResponseType.Starting:
                this.startGame(data);
                this.dialog.closeAll();
                break;
            case GameConnectionAttemptResponseType.Pending:
                // should never happen
                this.dialog.closeAll();
                break;
            case GameConnectionAttemptResponseType.Cancelled:
                if (!WarnPlayerModalComponent.opened) {
                    WarnPlayerModalComponent.opened = true;
                    this.dialog.open(WarnPlayerModalComponent, {
                        width: '450px',
                        height: '400x',
                        data: { warning: 3 },
                    });
                }
                break;
            case GameConnectionAttemptResponseType.Rejected:
                // should never happen
                this.dialog.closeAll();
                break;
        }
    }

    private limitedTimeCoopMode(data: typeof Events.FromServer.RESPONSE_TO_JOIN_GAME_REQUEST.type) {
        this.canRequest = true;
        this.gameMode = GameMode.LimitedTimeCoop;
        switch (data.responseType) {
            case GameConnectionAttemptResponseType.Starting:
                this.dialog.closeAll();
                if (this.name2ndPlayer === undefined) {
                    if (data.hostName) this.name2ndPlayer = data.hostName;
                }
                this.socketService.removeListener(Events.FromServer.PLAYER_STATUS);
                this.startGame(data);
                break;
            case GameConnectionAttemptResponseType.Pending:
                this.dataAwaitingPlayers.gameId = data.gameId;
                this.socketService.on(Events.FromServer.PLAYER_STATUS, (d: typeof Events.FromServer.PLAYER_STATUS.type) => {
                    if (d.playerConnectionStatus === PlayerConnectionStatus.Joined)
                        this.name2ndPlayer = d.user !== undefined ? d.user?.name : 'Anonymous';
                });
                if (!AwaitingPlayersModalComponent.opened) {
                    AwaitingPlayersModalComponent.opened = true;
                    this.dialog.open(AwaitingPlayersModalComponent, {
                        width: '500px',
                        height: 'fit-content',
                        backdropClass: 'backdropBackground',
                        data: this.dataAwaitingPlayers,
                    });
                }
                break;
            case GameConnectionAttemptResponseType.Cancelled:
                if (!WarnPlayerModalComponent.opened) {
                    WarnPlayerModalComponent.opened = true;
                    this.dialog.open(WarnPlayerModalComponent, {
                        width: '450px',
                        height: '400x',
                        data: { warning: 3 },
                    });
                }
                break;
        }
    }
}
