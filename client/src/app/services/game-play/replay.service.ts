import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { NB_MS_IN_SECOND, TICK } from '@app/constants/time-constants';
import { HttpService } from '@app/services/communication/http.service';
import { DelayService } from '@app/services/divers/delay.service';
import { GameDataService } from '@app/services/game-play/game-data.service';
import { SoundService } from '@app/services/game-play/sound.service';
import { PrivateUserDataDTO } from '@common/dto/user/private-user-data.dto';
import { GameMode } from '@common/enums/game-play/game-mode';
import { Speed } from '@common/enums/game-play/speed';
import {
    GameInformationForReplay,
    GameStateSnapshot,
    Replay,
    ReplayAction,
    ReplayInformationToRestore,
    ReplayInput,
} from '@common/interfaces/game-play/replay-action';
import { GameTimeService } from './game-time.service';
import { GameService } from './game.service';

@Injectable({
    providedIn: 'root',
})
export class ReplayService implements OnDestroy {
    isReplayMode: boolean;
    isReplaying: boolean;
    storeActions: boolean;
    replayEvent: EventEmitter<void>;
    replayActionTrigger: EventEmitter<{ category: string; input: ReplayInput }> = new EventEmitter();

    private gameService: GameService;
    private snapshots: GameStateSnapshot[] = [];
    private finalTime: number = 0;
    private replayActions: ReplayAction[];
    private actionIndex: number;
    private gameDetails: GameInformationForReplay;
    private replayInformationToRestore: ReplayInformationToRestore;
    private userData: PrivateUserDataDTO;

    // eslint-disable-next-line max-params
    constructor(
        private delayService: DelayService,
        private soundService: SoundService,
        private gameTimeService: GameTimeService,
        private gameDataService: GameDataService,
        private httpService: HttpService,
    ) {
        this.replayEvent = new EventEmitter<void>();
        this.reset();
    }

    get getterReplayInformationToRestore(): ReplayInformationToRestore {
        return this.replayInformationToRestore;
    }

    init(userData: PrivateUserDataDTO): void {
        this.userData = userData;
    }

    resetEverything(): void {
        this.snapshots = [];
        this.replayActions = [];
        this.finalTime = 0;
        this.actionIndex = 0;
        this.gameDetails = {
            recordedTimes: [],
            players: [],
            totalTime: 0,
            initialTime: 0,
            elapsedTime: 0,
            originalUrl: '',
            modifiedUrl: '',
            finalTime: 0,
            gameName: '',
            difficulty: '',
            gameId: '',
            nbOfPlayers: 0,
            gameMode: GameMode.None,
            totalDifferences: 0,
            gameValues: {
                timerTime: 0,
                penaltyTime: 0,
                gainedTime: 0,
            },
            timeToStart: 0,
            originalDifferencesUrls: [],
            flashingDifferencesUrls: [],
            cheatImages: [],
            isObserving: false,
        };
        this.replayInformationToRestore = {
            gameDetails: this.gameDetails,
            actions: [],
            snapshots: [],
        };
        this.isReplayMode = false;
        this.isReplaying = false;
        this.storeActions = true;
        this.gameTimeService.isReplayMode = false;
        this.gameTimeService.recordedTimeIndex = 0;
        this.gameTimeService.recordedTimes = [];
        this.gameDataService.isObserving = false;
        this.gameDataService.timeToStart = 0;
        this.gameDataService.playerNames = [];
        this.gameDataService.chronoTime = 0;
        this.gameDataService.originalPicture = '';
        this.gameDataService.modifiedPicture = '';
        this.gameDataService.gameID = '';
        this.gameDataService.nbOfPlayers = 0;
        this.gameDataService.differenceNbr = 0;
        this.gameDataService.difficulty = '';
        this.gameDataService.gameName = '';
        this.gameDataService.gameMode = GameMode.None;
        this.gameDataService.gameValues = {
            timerTime: 0,
            penaltyTime: 0,
            gainedTime: 0,
        };
        this.gameDataService.playerScores = [];
        this.gameDataService.foundDifferences = [];
        this.gameDataService.setOriginalDifferencesUrls([]);
        this.gameDataService.setFlashingDifferencesUrls([]);
        this.gameService?.cleanup();
    }

    setReplay(replay: Replay): void {
        this.snapshots = replay.snapshots;
        this.replayActions = replay.actions;
        this.gameDetails = replay.gameDetails;
        this.finalTime = this.gameDetails.finalTime;
        this.replayInformationToRestore = {
            gameDetails: this.gameDetails,
            actions: replay.actions,
            snapshots: replay.snapshots,
        };
        this.isReplayMode = true;
        this.setGameDetailsThroughoutAllTheGame(this.gameDetails);
        this.replay();
    }

    setGameDetailsThroughoutAllTheGame(gameDetails: GameInformationForReplay): void {
        this.gameDataService.gameID = gameDetails.gameId;
        this.gameDataService.playerNames = gameDetails.players;
        this.gameDataService.chronoTime = gameDetails.totalTime;
        this.gameDataService.originalPicture = gameDetails.originalUrl;
        this.gameDataService.modifiedPicture = gameDetails.modifiedUrl;
        this.gameDataService.gameName = gameDetails.gameName;
        this.gameDataService.difficulty = gameDetails.difficulty;
        this.gameDataService.nbOfPlayers = gameDetails.nbOfPlayers;
        this.gameDataService.gameMode = gameDetails.gameMode;
        this.gameDataService.differenceNbr = gameDetails.totalDifferences;
        this.gameDataService.gameValues = gameDetails.gameValues;
        this.gameDataService.timeToStart = gameDetails.timeToStart;
        this.gameDataService.setOriginalDifferencesUrls(gameDetails.originalDifferencesUrls);
        this.gameDataService.setFlashingDifferencesUrls(gameDetails.flashingDifferencesUrls);
        this.gameService.totalDifferences = gameDetails.totalDifferences;
    }

    initializeGameDetails(): void {
        this.gameDetails = {
            recordedTimes: this.gameTimeService.recordedTimes,
            players: this.gameDataService.playerNames,
            totalTime: this.gameDataService.chronoTime,
            initialTime: this.gameTimeService.getInitialTime(),
            elapsedTime: this.getElapsedTime(),
            originalUrl: this.gameDataService.originalPicture,
            modifiedUrl: this.gameDataService.modifiedPicture,
            finalTime: this.finalTime,
            gameName: this.gameDataService.gameName,
            difficulty: this.gameDataService.difficulty,
            gameId: this.gameDataService.gameID,
            nbOfPlayers: this.gameDataService.nbOfPlayers,
            gameMode: this.gameDataService.gameMode,
            totalDifferences: this.gameDataService.differenceNbr,
            gameValues: this.gameDataService.gameValues,
            timeToStart: this.gameDataService.timeToStart,
            originalDifferencesUrls: this.gameDataService.getOriginalDifferencesUrls(),
            flashingDifferencesUrls: this.gameDataService.getFlashingDifferencesUrls(),
            cheatImages: [],
            isObserving: this.gameDataService.isObserving,
        };
    }

    ngOnDestroy(): void {
        this.gameService?.cleanup();
    }

    setGameService(gameService: GameService) {
        if (!this.gameService) {
            this.gameService = gameService;
        }
    }

    getInitialTime(): number {
        return this.gameTimeService.getInitialTime();
    }

    getElapsedTime(): number {
        return this.gameTimeService.getInitialTime() - this.finalTime;
    }

    getCurrentGameState(): GameStateSnapshot {
        return {
            time: this.gameTimeService.replayTime,
            state: {
                totalDifferences: this.gameService?.totalDifferences,
                differencesFoundTotal: this.gameService?.differencesFoundTotal,
                originalDifferencesUrls: this.gameDataService.getOriginalDifferencesUrls(),
            },
        };
    }

    captureSnapshot(): void {
        if (this.isReplayMode) {
            return;
        }
        const currentState = this.getCurrentGameState();
        this.snapshots.push(currentState);
    }

    restoreGameStateFromTime(time: number): void {
        const snapshotIndex = this.findNextSnapshot(time);
        if (snapshotIndex < 0 || snapshotIndex >= this.snapshots.length) {
            return;
        }

        const snapshot = this.snapshots[snapshotIndex];
        this.restoreGameState({ time: snapshot.time, state: snapshot.state });
        this.resetActionIndexDependingOnTime(time);
    }

    restoreGameState(snapshotState: GameStateSnapshot): void {
        if (this.gameService) {
            this.gameService.totalDifferences = snapshotState.state.totalDifferences;
            this.gameService.differencesFoundTotal = snapshotState.state.differencesFoundTotal;
            this.gameDataService.setOriginalDifferencesUrls(snapshotState.state.originalDifferencesUrls);
        }
    }

    findNextSnapshot(time: number): number {
        let index = -1;
        let currentHighestTime = 0;
        for (let i = 0; i < this.snapshots.length; i++) {
            if (typeof this.snapshots[i].time === 'undefined') {
                continue;
            }
            if (this.snapshots[i].time <= time && this.snapshots[i].time > currentHighestTime) {
                index = i;
                currentHighestTime = this.snapshots[i].time;
                break;
            }
        }
        return index;
    }

    resetActionIndexDependingOnTime(time: number): void {
        this.actionIndex = this.findIndexBeforeNextAction(time);
    }

    findIndexBeforeNextAction(time: number): number {
        let index = 0;
        while (index < this.replayActions.length && this.replayActions[index].time >= time) {
            index++;
        }
        return index;
    }

    reset(): void {
        this.stop();
        this.delayService.timeIsPaused = false;
        this.delayService.changeSpeed(Speed.NORMAL);
        this.gameTimeService.recordedTimes = [];
        this.replayActions = [];
        this.isReplaying = false;
        this.storeActions = true;
        this.isReplayMode = false;
    }

    doAndStore(category: string, input: ReplayInput) {
        if (!this.isReplayMode) {
            this.captureSnapshot();
            this.store(category, input);
            this.doAction(category, input);
            this.captureSnapshot();
        }
    }

    doAction(category: string, input: ReplayInput) {
        this.replayActionTrigger.emit({ category, input });
    }

    store(category: string, input: ReplayInput) {
        if (this.storeActions && !this.isReplayMode) {
            this.captureSnapshot();
            this.replayActions.push({ time: this.gameTimeService.replayTime, category, input });
            this.finalTime = this.gameTimeService.replayTime;
        }
    }

    bundleReplayForPostRequest(): Replay {
        const replay: Replay = {
            gameDetails: this.gameDetails,
            actions: this.replayActions,
            snapshots: this.snapshots,
            createdAt: new Date(),
            createdBy: this.userData.username,
        };
        return replay;
    }

    postReplay(): void {
        this.initializeGameDetails();
        this.httpService.postReplay(this.bundleReplayForPostRequest());
    }

    pause(): void {
        this.delayService.pauseTime();
        this.soundService.pause();
    }

    resume(): void {
        this.delayService.resumeTime();
        this.soundService.resume();
    }

    restart(): void {
        this.stop();
        this.replay();
    }

    stop() {
        this.endOfReplay();
        this.soundService.pause();
        this.delayService.clearDelays();
    }

    endOfReplay() {
        this.isReplaying = false;
        this.delayService.clearCycles();
    }

    changeSpeed(speed: Speed) {
        this.delayService.changeSpeed(speed);
        this.soundService.speed = speed;
    }

    private tick() {
        this.gameTimeService.nextRecordedTime();
        let replayAction: ReplayAction;
        do {
            replayAction = this.replayActions[this.actionIndex];
            if (this.isSameTime(replayAction.time, this.gameTimeService.replayTime)) {
                this.actionIndex++;
                this.doAction(replayAction.category, replayAction.input);
            }
        } while (this.actionIndex < this.replayActions.length && this.isSameTime(replayAction.time, this.gameTimeService.replayTime));
    }

    private async replay(): Promise<void> {
        this.delayService.timeIsPaused = false;
        this.gameTimeService.isReplayMode = true;
        this.gameTimeService.recordedTimeIndex = 0;
        this.replayEvent.emit();
        this.isReplayMode = true;
        this.isReplaying = true;
        this.storeActions = false;
        this.actionIndex = 0;
        this.delayService.doCyclically(TICK * NB_MS_IN_SECOND, () => this.tick());
    }

    private isSameTime(time1: number, time2: number): boolean {
        const precision = 1e-3;
        return Math.abs(time1 - time2) < precision;
    }
}
