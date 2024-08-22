import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AwaitingPlayersModalComponent } from '@app/components/config-selection/awaiting-players-modal/awaiting-players-modal.component';
import { WarnPlayerModalComponent } from '@app/components/config-selection/warn-player-modal/warn-player-modal.component';
import { DIALOG_CUSTOM_CONFIG } from '@app/constants/dialog-config';
import { AwaitingPlayersModalProps } from '@app/interfaces/awaiting-players-modal-props';
import { GameSelection } from '@app/interfaces/game-card/game-selection';
import { AccountService } from '@app/services/account/account.service';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { FriendsService } from '@app/services/friends/friends.service';
import { ObserverService } from '@app/services/game-config/observer.service';
import { ChatService } from '@app/services/game-play/chat.service';
import { GameDataService } from '@app/services/game-play/game-data.service';
import { GameSelectorService } from '@app/services/game-selection/game-selector.service';
import { CarouselType } from '@common/enums/carousel-type';
import { GameConnectionAttemptResponseType } from '@common/enums/game-play/game-connection-attempt-response-type';
import { GameMode } from '@common/enums/game-play/game-mode';
import { PlayerConnectionStatus } from '@common/enums/game-play/player-connection-status';
import { GameConnectionRequestOutputMessageDto } from '@common/interfaces/game-play/game-connection-request.dto';
import * as Events from '@common/socket-event-constants';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-timed-selection-page',
    templateUrl: './timed-selection-page.component.html',
    styleUrls: ['./timed-selection-page.component.scss'],
})
export class TimedSelectionPageComponent implements OnInit, OnDestroy {
    carouselType = CarouselType;
    gameMode = GameMode.LimitedTimeDeathMatch;
    private componentDestroyed$: Subject<void> = new Subject<void>();
    private data: AwaitingPlayersModalProps = {
        playerName: '',
        gameId: '',
        waitingPlayers: [],
        displayMessage: 0,
        isLimitedTime: true,
    };

    // eslint-disable-next-line max-params
    constructor(
        private gameData: GameDataService,
        private socketService: SocketClientService,
        private dialog: MatDialog,
        private router: Router,
        private selectorService: GameSelectorService,
        private accountService: AccountService,
        private friendsService: FriendsService,
        private ongoingGameService: ObserverService,
        private chatService: ChatService,
    ) {}

    ngOnInit() {
        if (this.accountService.isLoggedIn) {
            this.selectorService.selectionValue.pipe(takeUntil(this.componentDestroyed$)).subscribe((values) => {
                this.choseGame(values);
            });
        } else {
            this.router.navigateByUrl('/login');
        }
    }

    ngOnDestroy() {
        this.socketService.removeListener(Events.FromServer.RESPONSE_TO_JOIN_GAME_REQUEST);
        this.dialog.closeAll();
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
    }

    createGame() {
        this.socketService.on(Events.FromServer.RESPONSE_TO_JOIN_GAME_REQUEST, this.limitedTime.bind(this));
        this.socketService.send(Events.ToServer.REQUEST_TO_PLAY, {
            gameMode: this.gameMode,
            playerName: this.accountService.currentUser ? this.accountService.currentUser.username : '',
            playersWithAccess: this.friendsService.getFriends(this.accountService.currentUser ? this.accountService.currentUser.username : ''),
        });
    }

    private startGame(arg: GameConnectionRequestOutputMessageDto) {
        this.gameData.observerNbr = 0;
        this.gameData.timeToStart = arg.startingIn;
        this.gameData.modifiedPicture = arg.modifiedImage;
        this.gameData.chronoTime = arg.time;
        this.gameData.gameID = arg.gameId;
        this.gameData.nbOfPlayers = arg.playerNbr;
        this.gameData.originalPicture = arg.originalImage;
        this.gameData.differenceNbr = arg.differenceNbr;
        this.gameData.name = this.accountService.currentUser ? this.accountService.currentUser.username : '';
        this.gameData.gameName = arg.gameName;
        this.gameData.gameMode = this.gameMode;
        this.gameData.gameValues = arg.gameValues;
        this.gameData.playerNames = this.data.waitingPlayers.map((player) => player.name);
        this.router.navigateByUrl('/game');
    }

    private removeWaitingPlayer(playerId: string) {
        for (let i = 0; i < this.data.waitingPlayers.length; i++) {
            const waitingPlayer = this.data.waitingPlayers[i];
            if (waitingPlayer.id === playerId) {
                this.data.waitingPlayers.splice(i, 1);
                return;
            }
        }
    }

    private limitedTime(data: GameConnectionRequestOutputMessageDto) {
        this.data.gameId = data.gameId;
        this.data.playerName = this.accountService.currentUser ? this.accountService.currentUser.username : '';
        if (data.members) this.data.waitingPlayers = data.members;
        switch (data.responseType) {
            case GameConnectionAttemptResponseType.Starting:
                this.dialog.closeAll();
                this.startGame(data);
                break;
            case GameConnectionAttemptResponseType.Pending: {
                this.chatService.gameId = data.gameId;
                const dialogRef = this.dialog.open(AwaitingPlayersModalComponent, {
                    width: 'fit-content',
                    height: 'fit-content',
                    backdropClass: 'backdropBackground',
                    data: this.data,
                });
                dialogRef.afterClosed().subscribe(() => {
                    this.socketService.removeListener(Events.FromServer.PLAYER_STATUS);
                });
                this.socketService.on(Events.FromServer.PLAYER_STATUS, (d: typeof Events.FromServer.PLAYER_STATUS.type) => {
                    if (d.user) {
                        switch (d.playerConnectionStatus) {
                            case PlayerConnectionStatus.Joined:
                                this.data.waitingPlayers.push(d.user);
                                break;
                            case PlayerConnectionStatus.Left:
                                this.removeWaitingPlayer(d.user.id);
                                break;
                        }
                    }
                });
                break;
            }
            case GameConnectionAttemptResponseType.Cancelled:
                {
                    const dialogConfig = Object.assign({}, DIALOG_CUSTOM_CONFIG);
                    dialogConfig.data = { warning: 0 };
                    this.dialog.closeAll();
                    this.dialog.open(WarnPlayerModalComponent, dialogConfig);
                    this.chatService.removeGamingChannel();
                }
                break;
            case GameConnectionAttemptResponseType.Rejected:
                {
                    const dialogConfig = Object.assign({}, DIALOG_CUSTOM_CONFIG);
                    dialogConfig.data = { warning: 1 };
                    this.dialog.closeAll();
                    this.dialog.open(WarnPlayerModalComponent, dialogConfig);
                    this.chatService.removeGamingChannel();
                }
                break;
        }
    }

    private choseGame(selection: GameSelection) {
        this.data.waitingPlayers = [];
        this.data.playerName = this.accountService.currentUser ? this.accountService.currentUser.username : '';
        switch (selection.carouselType) {
            case CarouselType.Timed:
                this.data.displayMessage = 2;
                break;
            case CarouselType.ObserveTimed:
                this.ongoingGameService.joinGame(selection.id);
                return;
        }
        this.data.displayMessage = 2;
        this.socketService.on(Events.FromServer.RESPONSE_TO_JOIN_GAME_REQUEST, this.limitedTime.bind(this));
        this.socketService.send(Events.ToServer.REQUEST_TO_PLAY, {
            gameMode: this.gameMode,
            gameId: selection.id,
            playerName: this.accountService.currentUser ? this.accountService.currentUser.username : '',
        });
    }
}
