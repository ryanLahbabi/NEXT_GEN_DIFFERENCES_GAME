import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { WarningDialogComponent } from '@app/components/config-selection/warning-dialog/warning-dialog.component';
import { ChatboxComponent } from '@app/components/game-play/chatbox/chatbox.component';
import { CongratsMessageCoopComponent } from '@app/components/game-play/congrats-message-coop/congrats-message-coop.component';
import { CongratsMessageTimeLimitedComponent } from '@app/components/game-play/congrats-message-time-limited/congrats-message-time-limited.component';
import { CongratsMessageComponent } from '@app/components/game-play/congrats-message/congrats-message.component';
import { DIALOG_CUSTOM_CONFIG } from '@app/constants/dialog-config';
import { AccountService } from '@app/services/account/account.service';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { ImageFileService } from '@app/services/divers/image-file.service';
import { ChatService } from '@app/services/game-play/chat.service';
import { GameDataService } from '@app/services/game-play/game-data.service';
import { GameTimeService } from '@app/services/game-play/game-time.service';
import { GameService } from '@app/services/game-play/game.service';
import { ReplayService } from '@app/services/game-play/replay.service';
import { SoundService } from '@app/services/game-play/sound.service';
import { GameMode } from '@common/enums/game-play/game-mode';
import { PlayerConnectionStatus } from '@common/enums/game-play/player-connection-status';
import { Speed } from '@common/enums/game-play/speed';
import { CardFiles } from '@common/interfaces/game-card/card-files';
import { DifferenceImages } from '@common/interfaces/game-play/difference-images';
import { GameClickOutputDto } from '@common/interfaces/game-play/game-click.dto';
import { EndgameOutputDto } from '@common/interfaces/game-play/game-endgame.dto';
import { GameValues } from '@common/interfaces/game-play/game-values';
import * as Events from '@common/socket-event-constants';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    @ViewChild('chatBox') chatBox: ChatboxComponent;

    chatView = true;
    originalUrl: string;
    modifiedUrl: string;
    playerGaveUp: boolean = false;
    finalTime: number;
    gameName: string;
    difficulty: string;
    gameId: string;
    nbOfPlayers: number;
    nextCardFiles: CardFiles[] = [];
    pendingCardUpdate = false;
    gameMode: GameMode;
    totalDifferences: number;
    gameValues: GameValues;
    numberOfObservers: number;
    playerScores: { name: string; score: number }[] = [];
    playerNames: string[];
    isObserving: boolean = false;

    private time: number;
    private componentDestroyed$: Subject<void> = new Subject<void>();

    // eslint-disable-next-line max-params
    constructor(
        public socketService: SocketClientService,
        public gameData: GameDataService,
        public dialog: MatDialog,
        private imageFileService: ImageFileService,
        private gameService: GameService,
        private replayService: ReplayService,
        private soundService: SoundService,
        private router: Router,
        private gameTimeService: GameTimeService,
        private chatService: ChatService,
        private accountService: AccountService,
    ) {}

    get isLimitedTime(): boolean {
        return this.gameMode === GameMode.LimitedTimeDeathMatch;
    }

    @HostListener('document:keyup.t', ['$event'])
    handleKeyUp() {
        this.gameService.cheating = !this.gameService.cheating;
        if (this.gameService.cheating) {
            this.socketService.send(Events.ToServer.CHEAT, this.gameId);
        }
    }

    ngOnInit(): void {
        if (this.router.url.includes('replay=true')) {
            this.setReplayMode();
        } else {
            if (this.accountService.isLoggedIn) {
                this.socketService.on(Events.FromServer.IS_PLAYING, (bool: typeof Events.FromServer.IS_PLAYING.type) => {
                    if (!bool) this.router.navigateByUrl('/home');
                });
                this.socketService.on(Events.FromServer.OBSERVER_LIST, (list: typeof Events.FromServer.OBSERVER_LIST.type) => {
                    this.numberOfObservers = list.length;
                });
                this.numberOfObservers = this.gameData.observerNbr;
                this.socketService.on(Events.FromServer.START_APP, () => this.socketService.send(Events.ToServer.IS_PLAYING));
                this.gameMode = this.gameData.gameMode;
                this.gameService.reset();
                this.gameValues = this.gameData.gameValues;
                this.replayService.reset();
                this.isObserving = this.gameData.isObserving;
                this.time = this.gameData.chronometerTime;
                this.gameId = this.gameData.gameID;
                this.originalUrl = this.imageFileService.base64StringToUrl(this.gameData.originalPicture);
                this.modifiedUrl = this.imageFileService.base64StringToUrl(this.gameData.modifiedPicture);
                this.difficulty = this.gameData.difficulty;
                this.nbOfPlayers = this.gameData.nbOfPlayers;
                this.gameService.totalDifferences = this.gameData.differenceNbr;
                this.totalDifferences = this.gameData.differenceNbr;
                this.gameName = this.gameData.gameName;
                if (this.gameData.name !== undefined) {
                    this.playerScores = [{ name: this.gameData.name, score: 0 }];
                    this.gameData.playerNames.forEach((name) => {
                        if (name !== this.gameData.name) this.playerScores.push({ name, score: 0 });
                    });
                } else if (this.gameData.playerScores) {
                    this.playerScores = this.gameData.playerScores;
                    this.gameService.differencesFoundTotal = this.gameData.playerScores.reduce((acc, playerScore) => (acc += playerScore.score), 0);
                }
                this.playerNames = this.playerScores.map((player) => player.name);
                this.gameData.isObserving = false;

                this.socketService.on(Events.FromServer.SOUNDBOARD, this.soundService.playSpecificSound.bind(this));
                this.socketService.on(Events.FromServer.CLICK_PERSONAL, this.processClickResponse.bind(this));
                this.socketService.on(Events.FromServer.ENDGAME, this.processEndGameEvent.bind(this));
                this.socketService.on(Events.FromServer.CLICK_ENEMY, this.processClickOpponentResponse.bind(this));
                this.gameTimeService.isReplayMode = false;
                this.gameTimeService.time = this.time;
                this.socketService.on(Events.FromServer.CHEAT, this.gameService.cheat.bind(this.gameService));
                this.gameService.canCheat = true;
                this.socketService.on(Events.FromServer.NEXT_CARD, this.processNextCardEvent.bind(this));
                this.replayService.replayEvent.subscribe(this.resetForReplay.bind(this));
                this.socketService.on(Events.FromServer.PLAYER_STATUS, this.processToLimitedTimeSinglePlayer.bind(this));
                this.soundService.speed = Speed.NORMAL;
                this.socketService.on(Events.FromServer.CHEAT_INDEX, this.gameService.removeCheatIndex.bind(this.gameService));
                if (this.gameMode === GameMode.LimitedTimeDeathMatch && this.gameData.nextCardFile) {
                    this.nextCardFiles.push({
                        name: this.gameData.nextCardFile.name,
                        nbDifferences: this.gameData.nextCardFile.nbDifferences,
                        difficulty: this.gameData.nextCardFile.difficulty,
                        originalImage: this.imageFileService.base64StringToUrl(this.gameData.nextCardFile.originalImage),
                        modifiedImage: this.imageFileService.base64StringToUrl(this.gameData.nextCardFile.modifiedImage),
                    });
                    this.gameData.nextCardFile = undefined;
                }
            } else {
                this.router.navigateByUrl('/login');
            }
        }
        this.replayService.replayActionTrigger.pipe(takeUntil(this.componentDestroyed$)).subscribe((action) => {
            this.handleReplayAction(action);
        });
    }

    toggleChatView() {
        this.chatView = !this.chatView;
    }

    ngOnDestroy(): void {
        this.gameService.cleanup();
        this.socketService.send(Events.ToServer.LEAVE_GAME, this.gameId);
        this.socketService.removeListener(Events.FromServer.PLAYER_STATUS);
        this.socketService.removeListener(Events.FromServer.ENDGAME);
        this.socketService.removeListener(Events.FromServer.CHEAT);
        this.socketService.removeListener(Events.FromServer.CLICK_ENEMY);
        this.socketService.removeListener(Events.FromServer.CLICK_PERSONAL);
        this.socketService.removeListener(Events.FromServer.NEXT_CARD);
        this.socketService.removeListener(Events.FromServer.CHEAT_INDEX);
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
        this.chatService.removeGamingChannel();
    }

    setReplayMode(): void {
        this.replayService.isReplayMode = true;
        this.gameTimeService.recordedTimes = this.replayService.getterReplayInformationToRestore.gameDetails.recordedTimes;
        this.initializeGameStateFromReplay();
    }

    toggleGiveUp(): void {
        const dialogConfig = Object.assign({}, DIALOG_CUSTOM_CONFIG);
        dialogConfig.data = 'abandonner la partie';
        this.dialog
            .open(WarningDialogComponent, dialogConfig)
            .afterClosed()
            .subscribe((confirmed: boolean) => {
                if (confirmed) {
                    this.socketService.send(Events.ToServer.LEAVE_GAME, this.gameId);
                    this.playerGaveUp = true;
                    this.router.navigateByUrl('/home');
                }
            });
    }

    isReplaying(): boolean {
        return this.replayService.isReplayMode;
    }

    showError() {
        this.soundService.playError();
        this.gameService.showErrorMessage();
    }

    showSuccess(differenceImages: DifferenceImages) {
        this.soundService.playSuccess();
        this.gameService.incrementDifferencesFound(differenceImages);
    }

    incrementPersonalDifference(): void {
        this.playerScores[0].score++;
    }

    private initializeGameStateFromReplay(): void {
        if (!this.replayService.getterReplayInformationToRestore || !this.replayService.getterReplayInformationToRestore.gameDetails) {
            return;
        }
        this.gameService.reset();
        this.gameMode = this.replayService.getterReplayInformationToRestore.gameDetails.gameMode;
        this.gameValues = this.replayService.getterReplayInformationToRestore.gameDetails.gameValues;
        this.isObserving = this.replayService.getterReplayInformationToRestore.gameDetails.isObserving;
        this.time = this.replayService.getterReplayInformationToRestore.gameDetails.elapsedTime;
        this.gameId = this.replayService.getterReplayInformationToRestore.gameDetails.gameId;
        this.originalUrl = this.imageFileService.base64StringToUrl(this.replayService.getterReplayInformationToRestore.gameDetails.originalUrl);
        this.modifiedUrl = this.imageFileService.base64StringToUrl(this.replayService.getterReplayInformationToRestore.gameDetails.modifiedUrl);
        this.difficulty = this.replayService.getterReplayInformationToRestore.gameDetails.difficulty;
        this.nbOfPlayers = this.replayService.getterReplayInformationToRestore.gameDetails.nbOfPlayers;
        this.gameService.totalDifferences = this.replayService.getterReplayInformationToRestore.gameDetails.totalDifferences;
        this.totalDifferences = this.replayService.getterReplayInformationToRestore.gameDetails.totalDifferences;
        this.gameName = this.replayService.getterReplayInformationToRestore.gameDetails.gameName;
        this.gameData.isObserving = false;
        this.gameTimeService.isReplayMode = true;
        this.gameTimeService.recordedTimes = this.replayService.getterReplayInformationToRestore.gameDetails.recordedTimes;
        this.gameTimeService.time = this.time;
        this.soundService.speed = Speed.NORMAL;
        this.replayService.replayEvent.subscribe(this.resetForReplay.bind(this));
        this.playerScores = this.replayService.getterReplayInformationToRestore.gameDetails.players
            ? this.replayService.getterReplayInformationToRestore.gameDetails.players.map((player) => ({ name: player, score: 0 }))
            : [];
    }

    private handleReplayAction(action: { category: string; input: unknown }) {
        switch (action.category as string) {
            case 'incrementPersonalDifference':
                this.incrementPersonalDifference();
                break;
            case 'showSuccess':
                this.showSuccess(action.input as DifferenceImages);
                break;
            case 'showError':
                this.showError();
                break;
            case 'processClickOpponentResponse':
                this.processClickOpponentResponse(action.input as GameClickOutputDto);
                break;
            case 'endOfReplay':
                this.replayService.endOfReplay();
                break;
        }
    }

    private processToLimitedTimeSinglePlayer(data: typeof Events.FromServer.PLAYER_STATUS.type): void {
        if (data.playerConnectionStatus === PlayerConnectionStatus.Left) {
            this.nbOfPlayers--;
            this.gameMode = GameMode.LimitedTimeSolo; // what
        }
    }

    private processNextCardEvent(data: CardFiles): void {
        const newCard: CardFiles = {
            name: data.name,
            originalImage: this.imageFileService.base64StringToUrl(data.originalImage),
            modifiedImage: this.imageFileService.base64StringToUrl(data.modifiedImage),
            nbDifferences: data.nbDifferences,
        };
        this.nextCardFiles.push(newCard);
        if (this.pendingCardUpdate) this.updateCards();
    }

    private updateCards() {
        if (this.isLimitedTime) {
            const newCard = this.nextCardFiles.shift();
            if (newCard) {
                this.gameService.cheating = false;
                this.originalUrl = newCard.originalImage;
                this.modifiedUrl = newCard.modifiedImage;
                this.gameName = newCard.name;
                this.totalDifferences = newCard.nbDifferences;
                this.pendingCardUpdate = false;
            } else this.pendingCardUpdate = true;
        }
    }

    private processClickOpponentResponse(data: GameClickOutputDto) {
        this.replayService.store('processClickOpponentResponse', data);
        if (data.valid) {
            this.gameService.differencesFoundTotal++;
            const enemy = this.playerScores.find((playerScore) => playerScore.name === data.playerName);
            if (enemy) enemy.score++;
            this.updateCards();
            this.processEnemySuccess({
                differenceNaturalOverlay: data.differenceNaturalOverlay as string,
                differenceFlashOverlay: data.differenceFlashOverlay as string,
            });
            if (this.isLimitedTime) {
                this.playerScores[0].score++;
            }
        }
    }

    private processClickResponse(data: GameClickOutputDto) {
        if (data.valid) {
            this.gameService.differencesFoundTotal++;
            this.updateCards();
            this.replayService.doAndStore('incrementPersonalDifference', data);
            this.processSuccess({
                differenceNaturalOverlay: data.differenceNaturalOverlay as string,
                differenceFlashOverlay: data.differenceFlashOverlay as string,
            });
        } else {
            this.processError();
        }
    }

    private processEndGameEvent(data: EndgameOutputDto) {
        if (data.players.find((p) => p.name === this.accountService.currentUser?.username)?.winner) {
            this.accountService.currentUser!.elo += 5;
        } else {
            this.accountService.currentUser!.elo -= 4;
        }
        switch (this.gameMode) {
            case GameMode.Classic1v1:
            case GameMode.ClassicDeathMatch:
                this.congratsMessageCoop(true, data);
                break;
            case GameMode.LimitedTimeSolo:
            case GameMode.LimitedTimeCoop:
            case GameMode.LimitedTimeDeathMatch:
                this.congratsMessage(false, true);
                break;
        }
        this.finalTime = data.finalTime ? data.finalTime : 0;
        this.gameService.canCheat = true;
        this.gameService.cheating = false;
        this.gameService.canCheat = false;
        this.replayService.store('endOfReplay', data);
    }

    private processSuccess(differenceImages: DifferenceImages) {
        this.replayService.doAndStore('showSuccess', differenceImages);
        this.chatService.differenceFound = true;
    }

    private processEnemySuccess(differenceImages: DifferenceImages) {
        this.soundService.playSuccess();
        this.gameService.flashDifferences(differenceImages);
    }

    private congratsMessage(replayIsAvailable: boolean, timeLimited: boolean): void {
        const dialogConfig = Object.assign({}, DIALOG_CUSTOM_CONFIG);
        dialogConfig.data = { replayIsAvailable };
        if (timeLimited) {
            this.dialog.open(CongratsMessageTimeLimitedComponent, dialogConfig);
        } else {
            this.dialog.open(CongratsMessageComponent, dialogConfig);
        }
    }

    private congratsMessageCoop(replayIsAvailable: boolean, message: EndgameOutputDto): void {
        const dialogConfig = Object.assign({}, DIALOG_CUSTOM_CONFIG);
        dialogConfig.data = { message, replayIsAvailable, isObserving: this.isObserving };
        this.dialog.open(CongratsMessageCoopComponent, dialogConfig);
    }

    private processError() {
        this.replayService.doAndStore('showError', true);
        this.chatService.differenceError = true;
    }

    private resetForReplay() {
        this.gameService.reset();
        this.time = this.gameData.chronometerTime;
        this.gameService.totalDifferences = this.gameData.differenceNbr;
        this.gameTimeService.time = this.time;
        if (this.playerScores) {
            this.playerScores.forEach((playerScore) => (playerScore.score = 0));
        }
    }
}
