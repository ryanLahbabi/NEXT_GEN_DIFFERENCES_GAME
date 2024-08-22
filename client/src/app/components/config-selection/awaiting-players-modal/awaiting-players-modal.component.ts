import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BanUserComponent } from '@app/components/game-creation/ban-user/ban-user.component';
import { DIALOG_CUSTOM_CONFIG } from '@app/constants/dialog-config';
import {
    DEFAULT_ADDED_TIME,
    DEFAULT_TOTAL_TIME,
    MAX_ADDED_TIME,
    MAX_PLAYER_NB,
    MAX_TOTAL_TIME,
    MIN_ADDED_TIME,
    MIN_PLAYER_NB,
    MIN_TOTAL_TIME,
} from '@app/constants/game-constants';
import { AwaitingPlayersModalProps } from '@app/interfaces/awaiting-players-modal-props';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { GameListManagerService } from '@app/services/divers/game-list-manager.service';
import { ChatService } from '@app/services/game-play/chat.service';
import { ReplayService } from '@app/services/game-play/replay.service';
import { GameAccessType } from '@common/enums/game-play/game-access-type.enum';
import { GameMode } from '@common/enums/game-play/game-mode';
import { FromServer, ToServer } from '@common/socket-event-constants';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-awaiting-players-modal',
    templateUrl: './awaiting-players-modal.component.html',
    styleUrls: ['./awaiting-players-modal.component.scss'],
})
export class AwaitingPlayersModalComponent implements OnDestroy, OnInit {
    static opened = false;
    @ViewChild('addedTimeInput') addedTimeInput: ElementRef;
    @ViewChild('totalTimeInput') totalTimeInput: ElementRef;
    addedTime: number;
    totalTime: number;
    chatView = true;
    canCheat: boolean;
    friendsOnly: boolean = false;
    friendsOfFriends: boolean = false;
    gameAccessType = GameAccessType;
    accessType: GameAccessType;
    isInWaitingRoom: boolean = false;
    private subscriptions = new Subscription();

    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<AwaitingPlayersModalComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: AwaitingPlayersModalProps,
        private socketService: SocketClientService,
        private dialog: MatDialog,
        public gameListManagerService: GameListManagerService,
        private replayService: ReplayService,
        private chatService: ChatService,
    ) {
        dialogRef.disableClose = true;
    }

    get isCreator(): boolean {
        return this.playerInfos[0].name === this.data.playerName;
    }

    get nbPlayers(): number {
        return this.data.waitingPlayers ? this.data.waitingPlayers.length : 0;
    }

    get isEnough(): boolean {
        return this.nbPlayers >= MIN_PLAYER_NB;
    }

    get isFull(): boolean {
        return this.nbPlayers >= MAX_PLAYER_NB;
    }

    get minAddedTime() {
        return MIN_ADDED_TIME;
    }

    get maxAddedTime() {
        return MAX_ADDED_TIME;
    }

    get minTotalTime() {
        return MIN_TOTAL_TIME;
    }

    get maxTotalTime() {
        return MAX_TOTAL_TIME;
    }

    get gameMode(): GameMode {
        return this.data.isLimitedTime ? GameMode.LimitedTimeDeathMatch : GameMode.ClassicDeathMatch;
    }

    get playerInfos(): { avatar: string; name: string }[] {
        if (this.data.waitingPlayers) {
            const players = this.data.waitingPlayers.map((player) => ({
                name: player.name,
                avatar: player.avatar,
            }));
            if (players.length < MAX_PLAYER_NB) {
                while (players.length < MAX_PLAYER_NB) {
                    players.push({ name: '', avatar: '' });
                }
                return players;
            } else {
                return players.slice(0, MAX_PLAYER_NB);
            }
        } else {
            return [];
        }
    }

    ngOnDestroy(): void {
        this.socketService.removeListener(FromServer.RESPONSE_TO_JOIN_GAME_REQUEST);
        AwaitingPlayersModalComponent.opened = false;
    }

    ngOnInit() {
        this.updateGameAccess();
        // this.gameListManagerService.updateAccessTypeOnQuit(this.gameListManagerService.oldGames);
        // console.log("data");
        // console.log(this.data);
        this.chatService.addGamingChannel();
        this.replayService.resetEverything();
        AwaitingPlayersModalComponent.opened = true;
        this.addedTime = DEFAULT_ADDED_TIME;
        this.totalTime = DEFAULT_TOTAL_TIME;
        this.isInWaitingRoom = true;
        this.subscriptions.add(
            this.gameListManagerService.accessType$.subscribe((type) => {
                this.accessType = type;
                this.checkAndBanUser();
            }),
        );
    }

    closeDialog() {
        this.isInWaitingRoom = false;
        this.isInWaitingRoom = false;
        this.dialogRef.close();
        this.chatService.removeGamingChannel();
        this.socketService.send(ToServer.LEAVE_GAME, this.data.gameId);
    }

    toggleChatView() {
        this.chatView = !this.chatView;
    }

    startGame() {
        if (this.nbPlayers >= MIN_PLAYER_NB) {
            this.socketService.send(ToServer.START_GAME, {
                gameId: this.data.gameId,
                totalTime: this.totalTime,
                canCheat: this.canCheat,
                friendsOnly: this.friendsOnly,
                friendsOfFriends: this.friendsOfFriends,
                addedTime: this.data.isLimitedTime ? this.addedTime : undefined,
            });
        }
    }

    validatePlayer(canJoin: boolean, playerId: string, playerName: string) {
        const waitingPlayer = {
            name: playerName,
            id: playerId,
            avatar: '',
        };
        if (canJoin) {
            try {
                this.data.waitingPlayers[0] = waitingPlayer;
            } catch (e) {
                canJoin = false;
            }
        }
        this.socketService.send(ToServer.PLAYER_VALIDATION, {
            playerId,
            gameId: this.data.gameId,
            canJoin,
        });
    }

    validateAddedTimeInput() {
        if (this.addedTime < this.minAddedTime) {
            this.addedTimeInput.nativeElement.value = this.minAddedTime;
            this.addedTime = this.minAddedTime;
        } else if (this.addedTime > this.maxAddedTime) {
            this.addedTimeInput.nativeElement.value = this.maxAddedTime;
            this.addedTime = this.maxAddedTime;
        }
    }

    validateTotalTimeInput() {
        if (this.totalTime < this.minTotalTime) {
            this.totalTimeInput.nativeElement.value = this.minTotalTime;
            this.totalTime = this.minTotalTime;
        } else if (this.totalTime > this.maxTotalTime) {
            this.totalTimeInput.nativeElement.value = this.maxTotalTime;
            this.totalTime = this.maxTotalTime;
        }
    }

    onAccessFriends(): void {
        if (this.friendsOnly) {
            this.friendsOfFriends = false;
        }

        this.updateGameAccess();
    }

    onAccessFriendsOfFriends(): void {
        if (this.friendsOfFriends) {
            this.friendsOnly = false;
        }
        this.updateGameAccess();
    }

    checkAndBanUser(): void {
        const shouldBeBanned = !this.isCreator && this.isInWaitingRoom;
        const dialogConfig = Object.assign({}, DIALOG_CUSTOM_CONFIG);
        if (!this.gameListManagerService.getJoinableGames(this.gameMode).some((game) => game.gameId === this.data.gameId) && shouldBeBanned) {
            this.dialog.open(BanUserComponent, dialogConfig);
            this.closeDialog();
        }
    }

    private updateGameAccess(): void {
        if (this.friendsOnly) {
            this.gameListManagerService.sendAccessType(GameAccessType.Friends, this.data.gameId);
        } else if (this.friendsOfFriends) {
            this.gameListManagerService.sendAccessType(GameAccessType.FriendsOfFriends, this.data.gameId);
        } else {
            this.gameListManagerService.sendAccessType(GameAccessType.Everyone, this.data.gameId);
        }
    }
}
