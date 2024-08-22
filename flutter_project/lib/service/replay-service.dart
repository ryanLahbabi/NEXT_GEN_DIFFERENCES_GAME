// ignore_for_file: unused_label, unnecessary_import
import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_project/classes/gamePlay/differences-images.dart';
import 'package:flutter_project/classes/gamePlay/game-values.dart';
import 'package:flutter_project/classes/gamePlay/player-info.dart';
import 'package:flutter_project/common/enum.dart';
import 'package:flutter_project/common/replay-constants.dart';
import 'package:flutter_project/dtos/replay-dto.dart';
import 'package:flutter_project/environnment.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:flutter_project/service/delay-service.dart';
import 'package:flutter_project/service/game-data-service.dart';
import 'package:flutter_project/service/game-service.dart';
import 'package:flutter_project/service/sound-service.dart';
import 'package:http/http.dart' as http;

class ReplayService with ChangeNotifier {
  final String baseUrl = Environnment.httpLink;

  DelayService _delayService = DelayService();
  GameService _gameService = GameService();
  SoundService _soundService = SoundService();

  bool isReplayMode = false;
  bool isReplayingReplay = false;
  bool isReplaying = false;
  bool storeActions = true;

  List<GameStateSnapshot> snapshots = [];
  double finalTime = 0;
  get getFinalTime => _gameService.getFinalRecordedTime();
  List<ReplayAction> replayActions = [];
  int actionIndex = 0;
  GameInformationForReplay gameDetails = GameInformationForReplay(
    recordedTimes: [],
    players: [],
    totalTime: 0.0,
    initialTime: 0.0,
    elapsedTime: 0.0,
    originalUrl: '',
    modifiedUrl: '',
    finalTime: 0.0,
    gameName: '',
    difficulty: '',
    gameId: '',
    nbOfPlayers: 0,
    gameMode: GameMode.ClassicDeathMatch,
    totalDifferences: 0,
    gameValues: GameValues(),
    timeToStart: 0,
    originalDifferencesUrls: [],
    flashingDifferencesUrls: [],
    cheatImages: [],
    isObserving: false,
  );

  ReplayInformationToRestore replayInformationToRestore =
      ReplayInformationToRestore(
          gameDetails: GameInformationForReplay(
            recordedTimes: [],
            players: [],
            totalTime: 0.0,
            initialTime: 0.0,
            elapsedTime: 0.0,
            originalUrl: '',
            modifiedUrl: '',
            finalTime: 0.0,
            gameName: '',
            difficulty: '',
            gameId: '',
            nbOfPlayers: 0,
            gameMode: GameMode.ClassicDeathMatch,
            totalDifferences: 0,
            gameValues: GameValues(),
            timeToStart: 0,
            originalDifferencesUrls: [],
            flashingDifferencesUrls: [],
            cheatImages: [],
            isObserving: false,
          ),
          actions: [],
          snapshots: []);

  StreamController<void> replayEvent = StreamController.broadcast();
  StreamController<ReplayAction> replayActionTrigger =
      StreamController<ReplayAction>.broadcast();
  StreamController<double> _replayTimeController =
      StreamController<double>.broadcast();
  StreamController<bool> isResetReplayController =
      StreamController<bool>.broadcast();

  Stream<double> get replayTimeStream => _replayTimeController.stream;
  Stream<ReplayAction> get replayActionTriggered => replayActionTrigger.stream;
  Stream<bool> get isResetReplayStream => isResetReplayController.stream;

  static final ReplayService _instance = ReplayService._internal(
      DelayService(), GameService.instance, SoundService());

  factory ReplayService() {
    return _instance;
  }

  static ReplayService get instance => _instance;

  ReplayService._internal(
      this._delayService, this._gameService, this._soundService);

  void closeStreams() {
    replayEvent.close();
    replayActionTrigger.close();
    _replayTimeController.close();
  }

  void reinitializeStreams() {
    closeStreams();
    replayEvent = StreamController.broadcast();
    replayActionTrigger = StreamController<ReplayAction>.broadcast();
    _replayTimeController = StreamController<double>.broadcast();
  }

  void initialize(DelayService delayService, GameService gameService,
      SoundService soundService, GameDataService gameDataService) {
    _delayService = delayService;
    _gameService = gameService;
    _soundService = soundService;
  }

  void resetEveryValueInTheGame() {
    gameDetails.elapsedTime = 0;
    gameDetails.totalTime = 0;
    gameDetails.finalTime = 0;
    gameDetails.initialTime = 0;
    _gameService.recordedTimes = [];

    _gameService.differencesFoundTotal = 0;
    _gameService.totalDifferences = 0;
    _gameService.time = getInitialTime();
    _gameService.recordedTimeIndex = 0;
    snapshots = [];
    replayActions = [];
    actionIndex = 0;
    _gameService.gameData.playersInfo.forEach((player) {
      if (player.username != "Observer") {
        player.score = 0;
      }
    });
  }

  double getCurrentTime() {
    return _gameService.time;
  }

  void setDifferenceOverlay(DifferenceImages newValue) {
    _gameService.updateDifferenceOverlay(newValue);
    notifyListeners();
  }

  void setReplay(Replay replay) {
    gameDetails = replay.gameDetails;
    replayActions = replay.actions;
    snapshots = replay.snapshots;
    finalTime = replay.gameDetails.finalTime;
    replayInformationToRestore = ReplayInformationToRestore(
        gameDetails: replay.gameDetails,
        actions: replay.actions,
        snapshots: replay.snapshots);
    isReplayMode = true;
    //print("running setReplayThroughAllTheGame");

    setGameDetailsThroughoutAllTheGame(gameDetails);

    restart();
  }

  int getDifficulty(String difficulty) {
    if (difficulty == 'facile') {
      return 0;
    } else if (difficulty == 'difficile') {
      return 1;
    } else {
      return 0;
    }
  }

  void setGameDetailsThroughoutAllTheGame(
      GameInformationForReplay gameDetails) {
    GameDataService.instance.gameID = gameDetails.gameId;
    GameDataService.instance.playersInfo = gameDetails.players
        .map((playerName) => PlayerInfo(username: playerName))
        .toList();
    GameDataService.instance.chronometerTime = gameDetails.totalTime;
    GameDataService.instance.originalPicture = gameDetails.originalUrl;
    replayActionTrigger.add(ReplayAction(
        time: getInitialTime(),
        category: 'startOriginalPicture',
        input: ReplayInput<String>(value: gameDetails.originalUrl)));

    GameService.instance.originalImageLimited.add(gameDetails.originalUrl);

    GameService.instance.modifiedImageLimited.add(gameDetails.modifiedUrl);

    GameDataService.instance.modifiedPicture = gameDetails.modifiedUrl;
    replayActionTrigger.add(ReplayAction(
        time: getInitialTime(),
        category: 'startModifiedPicture',
        input: ReplayInput<String>(value: gameDetails.modifiedUrl)));
    GameDataService.instance.gameName = gameDetails.gameName;
    GameDataService.instance.difficulty = getDifficulty(gameDetails.difficulty);
    GameDataService.instance.nbOfPlayers = gameDetails.nbOfPlayers;
    GameDataService.instance.gameMode = gameDetails.gameMode;
    GameDataService.instance.differenceNbr = gameDetails.totalDifferences;
    GameDataService.instance.gameValues = gameDetails.gameValues;
    GameDataService.instance.timeToStart = gameDetails.timeToStart;
    GameService.instance.latestDifferenceOverlay =
        gameDetails.originalDifferencesUrls;
    GameService.instance.latestFlickerEvent =
        gameDetails.flashingDifferencesUrls;
    GameService.instance.totalDifferences = gameDetails.totalDifferences;
    GameService.instance.differencesFoundTotal = 0;
    GameDataService.instance.isObserver = gameDetails.isObserving;
    GameService.instance.recordedTimes = gameDetails.recordedTimes;
    GameService.instance.recordedTimeIndex = 0;
  }

  void initializeGameDetails() {
    gameDetails = GameInformationForReplay(
      recordedTimes: _gameService.recordedTimes,
      players: GameDataService.instance.playersInfo
          .map((player) => player.username)
          .toList(),
      totalTime: getInitialTime(),
      initialTime: getInitialTime(),
      elapsedTime: getElapsedTime(),
      originalUrl: GameService.instance.originalImageLimited.first,
      modifiedUrl: GameService.instance.modifiedImageLimited.first,
      finalTime: finalTime,
      gameName: GameDataService.instance.gameName,
      difficulty: GameDataService.instance.difficulty.toString(),
      gameId: GameDataService.instance.gameID,
      nbOfPlayers: GameDataService.instance.nbOfPlayers,
      gameMode: GameDataService.instance.gameMode,
      totalDifferences: GameDataService.instance.differenceNbr,
      gameValues: GameDataService.instance.gameValues,
      timeToStart: GameDataService.instance.timeToStart,
      originalDifferencesUrls: GameService.instance.latestDifferenceOverlay,
      flashingDifferencesUrls: GameService.instance.latestFlickerEvent,
      cheatImages: GameService.instance.latestFlickerEvent,
      isObserving: GameDataService.instance.isObserver,
    );
    print("gameDetails");
    print(gameDetails.originalUrl);
  }

  double getInitialTime() {
    return _gameService.getInitialTime();
  }

  double getElapsedTime() {
    return getInitialTime() - getFinalTime;
  }

  GameStateSnapshot getCurrentGameState() {
    return GameStateSnapshot(
      time: _gameService.time,
      state: GameState(
        totalDifferences: GameService.instance.totalDifferences,
        differencesFoundTotal: GameService.instance.differencesFoundTotal,
        originalDifferencesUrls: GameService.instance.latestDifferenceOverlay,
      ),
    );
  }

  void captureSnapshot() {
    if (isReplayMode) {
      return;
    }
    snapshots.add(getCurrentGameState());
  }

  void restoreGameStateFromTime(double time) {
    //print("in restoreGameStateFromTime");
    //print("time: $time");

    int snapshotIndex = findNextSnapshot(time);
    if (snapshotIndex < 0 || snapshotIndex >= snapshots.length) {
      return;
    } else {
      restoreGameState(snapshots[snapshotIndex]);
      GameService.instance.differenceOverlayController.close();
      //undoLastSnapShot();
      //restoreSnapshotBefore(time);

      GameService.instance.differenceOverlayController =
          StreamController<String>.broadcast();
      isResetReplayController.add(true);
      restoreGameState(snapshots[snapshotIndex]);
      resetActionIndexDependingOnTime(time);
    }
  }

  void restoreSnapshotBefore(double time) {
    int index = 0;
    double currentClosestTime = 0.0;
    for (int i = 0; i < snapshots.length; i++) {
      if (snapshots[i].time >= time && snapshots[i].time < currentClosestTime) {
        print("WENT IN");
        index = i;
        currentClosestTime = snapshots[i].time;
      }
    }

    List<String> differencesUrls =
        snapshots[index].state.originalDifferencesUrls;

    print("RESTORESNAPSHOTBEFORE");

    for (int i = 0; i < differencesUrls.length; i++) {
      if (differencesUrls != []) {
        print("RestoreSnapShot");
        GameService.instance.differenceOverlayController.sink
            .add(differencesUrls[i]);
      }
    }
  }

  void undoLastSnapShot() {
    List<String> differencesUrls = snapshots.last.state.originalDifferencesUrls;

    for (int i = 0; i < differencesUrls.length; i++) {
      print("UNDOLASTSNAPSHOT");
      if (differencesUrls.isNotEmpty) {
        GameService.instance.differenceOverlayController.sink
            .add(differencesUrls[i]);
      }
    }
  }

  void restoreGameState(GameStateSnapshot snapshot) {
    _gameService.totalDifferences = snapshot.state.totalDifferences;
    _gameService.differencesFoundTotal = snapshot.state.differencesFoundTotal;
  }

  int findNextSnapshot(double time) {
    int index = -1;
    double currentHighestTime = 0.0;
    for (int i = 0; i < snapshots.length; i++) {
      if (snapshots[i].time <= time && snapshots[i].time > currentHighestTime) {
        index = i;
        currentHighestTime = snapshots[i].time;
      }
    }
    return index;
  }

  resetActionIndexDependingOnTime(double Time) {
    actionIndex = findIndexBeforeNextAction(Time);
  }

  int findIndexBeforeNextAction(double time) {
    int index = 0;
    while (index < replayActions.length && replayActions[index].time >= time) {
      index++;
    }
    return index;
  }

  void reset() {
    stop();
    _delayService.timeIsPaused = false;
    _delayService.changeSpeed(Speed.NORMAL);
    _gameService.recordedTimes = [];
    replayActions = [];
    isReplaying = false;
    storeActions = true;
    isReplayMode = false;
  }

  void doAction(String category, dynamic input) {
    //print("in do action");
    replayActionTrigger.add(ReplayAction(
        time: _gameService.time, category: category, input: input));
  }

  void store(String category, ReplayInput<dynamic> input) {
    //print("in store");
    //print("isReplaying: $isReplaying");
    //print("storeActions: $storeActions");
    if (storeActions && !isReplaying) {
      captureSnapshot();

      replayActions.add(ReplayAction(
          time: _gameService.recordedTimes.last,
          category: category,
          input: input));
      finalTime = _gameService.time;
    }
  }

  doAndStore(String category, ReplayInput input) {
    isResetReplayController.add(false);
    if (!isReplayMode) {
      captureSnapshot();
      store(category, input);
      doAction(category, input);
      captureSnapshot();
    }
  }

  Replay bundleReplayForPostRequest() {
    return Replay(
        gameDetails: gameDetails,
        actions: replayActions,
        snapshots: snapshots,
        createdAt: DateTime.now(),
        createdBy: AuthService.instance.username);
  }

  Future<Replay> requestToPostReplay() async {
    Replay replay = bundleReplayForPostRequest();
    final token = AuthService.instance.token;
    print("tttttttttttttttt");
    print(replay.toJson());
    var json = replay.toJson();
    print(jsonEncode(json));

    final response = await http.post(
      Uri.parse('$baseUrl/replays'),
      body: jsonEncode({"replay": replay.toJson()}),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    print(response);

    if (response.statusCode == 200) {
      print("reussi");
      return replay;
    } else {
      throw Exception('Failed to post replay: ${response.body}');
    }
  }

  void postReplay() {
    initializeGameDetails();
    requestToPostReplay();
  }

  void pause() {
    _delayService.pauseTime();
    _soundService.pause();
    print("PAUSE");
    GameService().cheatDataController.add([]);
    GameDataService().showCheat = false;
  }

  void resume() {
    _delayService.resumeTime();
    _soundService.resume();
  }

  void restart() {
    _gameService.gameData.playersInfo.forEach((player) {
      player.score = 0;
    });
    //restoreGameStateFromTime(getInitialTime());
    //print("in restart");
    stop();
    doReplay();
  }

  void stop() {
    endOfReplay();
    _soundService.pause();
    _delayService.clearDelays();
  }

  endOfReplay() {
    isReplaying = false;
    _delayService.clearCycles();
  }

  bool isSameTime(double time1, double time2) {
    const precision = 0.001;
    return (time1 - time2).abs() < precision;
  }

  void changeSpeed(Speed newSpeed) {
    _delayService.changeSpeed(newSpeed);
    _soundService.setSpeed(newSpeed);
  }

  void tick() {
    //print("actionIndex: $actionIndex");
    //print("replayActions.length: ${replayActions.length}");
    if (_gameService.recordedTimeIndex >= _gameService.recordedTimes.length) {
      pause();
      return;
    }
    _gameService.nextRecordedTime();
    double currentTime =
        _gameService.recordedTimes[_gameService.recordedTimeIndex];
    _replayTimeController.add(currentTime);
    do {
      ReplayAction replayAction = replayActions[actionIndex];
      if (isSameTime(replayAction.time,
          _gameService.recordedTimes[_gameService.recordedTimeIndex])) {
        //print("replayAction.time: ${replayAction.time}");
        actionIndex++;
        doAction(replayAction.category, replayAction.input);
      }
    } while (actionIndex < replayActions.length &&
        isSameTime(replayActions[actionIndex].time,
            _gameService.recordedTimes[_gameService.recordedTimeIndex]));
  }

  void doReplay() {
    _delayService.timeIsPaused = false;
    _gameService.isReplayMode = true;
    _gameService.recordedTimeIndex = 0;
    // replayEvent.emit(); // This is meant to trigger the replay in other components
    isReplayMode = true;
    isReplaying = true;
    storeActions = false;
    actionIndex = 0;
    _delayService.doCyclically(NB_MS_IN_SECOND * TICK, () {
      //print("replayActions.length: ${replayActions.length}");
      if (actionIndex < replayActions.length &&
          _gameService.recordedTimeIndex < _gameService.recordedTimes.length) {
        tick();
        print("tickcccccccccccccccccccccccccccccccccccccccc");
        print(DelayService.instance.speed);
      } else {
        pause();
      }
    });
  }

  @override
  void dispose() {
    closeStreams();
    // replayEvent.close();
    // replayActionTrigger.close();
    // _replayTimeController.close();
    super.dispose();
  }
}
