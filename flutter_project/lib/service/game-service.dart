// ignore_for_file: file_names

import 'dart:async';

import 'package:flutter_project/classes/communication-socket.dart';
import 'package:flutter_project/classes/gamePlay/differences-images.dart';
import 'package:flutter_project/classes/gamePlay/game-click-output.dart';
import 'package:flutter_project/classes/gamePlay/game-values.dart';
import 'package:flutter_project/classes/gamePlay/player-info.dart';
import 'package:flutter_project/common/enum.dart';
import 'package:flutter_project/common/replay-constants.dart';
import 'package:flutter_project/common/socket-event-constants.dart';
import 'package:flutter_project/dtos/game-end-dto.dart';
import 'package:flutter_project/dtos/replay-dto.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:flutter_project/service/delay-service.dart';
import 'package:flutter_project/service/game-data-service.dart';
import 'package:flutter_project/service/message-service.dart';
import 'package:flutter_project/service/replay-service.dart';
import 'package:flutter_project/service/sound-service.dart';
import 'package:flutter_project/widget/game-play/error-widget.dart';

class GameService {
  static final GameService _instance = GameService._privateConstructor();
  final SoundService _soundService = SoundService();
  final DelayService _delayService = DelayService();
  final GameDataService _gameDataService = GameDataService();
  ReplayService? _replayService;

  ReplayService getReplayService() {
    _replayService ??= ReplayService()
      ..initialize(_delayService, this, _soundService, _gameDataService);
    return _replayService!;
  }

  void Function(double x, double y)? onErrorClick;

  GameService._privateConstructor();

  factory GameService() {
    return _instance;
  }

  static GameService get instance => _instance;

  List<String> _latestDifferenceOverlay = [];
  List<String> get latestDifferenceOverlay => _latestDifferenceOverlay;
  set latestDifferenceOverlay(List<String> value) {
    _latestDifferenceOverlay = value;
  }

  List<String> _latestFlickerEvent = [];
  List<String> get latestFlickerEvent => _latestFlickerEvent;
  set latestFlickerEvent(List<String> value) {
    _latestFlickerEvent = value;
  }

  void updateDifferenceOverlay(DifferenceImages newValue) {
    //TODO: I KNOW THIS IS BAD BUT I break other things when i fix it proprely
    print(newValue);
    _latestDifferenceOverlay.add(newValue.differenceNaturalOverlay.toString());
    differenceOverlayController
        .add(newValue.differenceNaturalOverlay.toString());
  }

  void differenceControllerUpdate(String newValue) {
    differenceOverlayController.add(newValue);
  }

  void updateFlickerEvent(String newValue) {
    _soundService.playSuccess();
    _latestFlickerEvent.add(newValue);
    flickerEventController.add(newValue);
  }

  void updateImage(DifferenceImages data) {
    print("uuuuuuuuuuuuuuuuuuuu");
    print(data.differenceFlashOverlay.toString());
    print(data.differenceNaturalOverlay.toString());

    updateFlickerEvent(data.differenceFlashOverlay.toString());
    Future.delayed(Duration(seconds: 1), () {
      updateDifferenceOverlay(data);
    });
  }

// Equivalent GameTimeService in GameService
  bool isReplayMode = false;
  List<double> recordedTimes = [];
  int recordedTimeIndex = 0;
  bool firstTimeRecorded = false;

  double getInitialTime() {
    if (recordedTimes.isEmpty) {
      return 0;
    }

    double maxTime = recordedTimes[0];
    for (int i = 1; i < recordedTimes.length; i++) {
      if (recordedTimes[i] > maxTime) {
        maxTime = recordedTimes[i];
      }
    }
    return maxTime;
  }

  void nextRecordedTime() {
    if (recordedTimes.isEmpty) {
      return;
    }

    if (recordedTimeIndex >= recordedTimes.length) {
      time = recordedTimes[recordedTimes.length - 1];
    }

    //print('recordedTimeIndex: $recordedTimeIndex');
    //print('current time: $time');
    time = recordedTimes[recordedTimeIndex];
    _timeUpdateController.add(time.round());

    recordedTimeIndex++;
  }

// ----------------------------

  bool initialized = false;
  bool canCheat = false;
  int totalDifferences = 0;
  int differencesFoundTotal = 0;
  int clickX = 0;
  int clickY = 0;

  List<String> originalImageLimited = [];
  List<String> modifiedImageLimited = [];
  List<String> gameNameList = [];
  List<int> nbDifferencesList = [];

  bool playerAbandoned = false;
  int finalTime = 0;

  double getFinalRecordedTime() {
    if (recordedTimes.isEmpty) {
      return 0;
    }

    double maxTime = recordedTimes[0];
    for (int i = 1; i < recordedTimes.length; i++) {
      if (recordedTimes[i] < maxTime) {
        maxTime = recordedTimes[i];
      }
    }
    return maxTime;
  }

  String gameName = "";
  String currentUsername = AuthService.instance.username;
  String? userName2ndPlayer;
  String difficulty = "";
  int personalDifference = 0;
  int enemyDifference = 0;
  String gameID = "";
  //bool isCheatAllowed = false;
  int nbOfPlayers = 0;
  GameEndData? lastGameEndData;
  bool hasGameEnded = false;

  bool pendingCardUpdate = false;
  GameMode gameMode = GameMode.None;
  GameValues gameValues = GameValues();
  List<String> cheatData = [];

  double time = 0;
  int positionX = 0;
  int positionY = 0;
  int globalX = 0;
  int globalY = 0;

  StreamController<String> differenceOverlayController =
      StreamController<String>.broadcast();
  StreamController<String> flickerEventController =
      StreamController<String>.broadcast();
  StreamController<ErrorMarkerData> errorMarkerController =
      StreamController<ErrorMarkerData>.broadcast();
  StreamController<int> _timeUpdateController =
      StreamController<int>.broadcast();
  StreamController<List<String>> cheatDataController =
      StreamController<List<String>>.broadcast();
  StreamController<dynamic> _gameEndController =
      StreamController<dynamic>.broadcast();
  StreamController<bool> _navigateToGameScreenController =
      StreamController<bool>.broadcast();
  StreamController<DifferenceImages> differenceFoundController =
      StreamController<DifferenceImages>.broadcast();
  StreamController<List<String?>> cheatController =
      StreamController<List<String?>>.broadcast();
  // StreamController<int> removeCheatController;
  StreamController<bool> showErrorController =
      StreamController<bool>.broadcast();
  StreamController<List<String>> _nextCardOgController =
      StreamController<List<String>>.broadcast();
  StreamController<List<String>> _nextCardNewController =
      StreamController<List<String>>.broadcast();
  StreamController<List<PlayerInfo>> _playerInfoController =
      StreamController<List<PlayerInfo>>.broadcast();
  StreamController<List<String>> _gameNameController =
      StreamController<List<String>>.broadcast();
  StreamController<int> _observerNbrController =
      StreamController<int>.broadcast();
  StreamController<List<int>> _nbrDifferenceController =
      StreamController<List<int>>.broadcast();

  //StreamController<bool> isCheatActive = StreamController<bool>.broadcast();

  StreamSubscription<ReplayAction>? _replayActionSubscription;

  Stream<List<int>> get nbrDifferenceStream => _nbrDifferenceController.stream;
  Stream<List<String>> get gameNameStream => _gameNameController.stream;
  Stream<int> get observerNbrStream => _observerNbrController.stream;
  Stream<List<PlayerInfo>> get playerInfoStream => _playerInfoController.stream;
  Stream<String> get differenceOverlayStream =>
      differenceOverlayController.stream;
  Stream<dynamic> get gameEndStream => _gameEndController.stream;
  Stream<String> get flickerEventStream => flickerEventController.stream;
  Stream<ErrorMarkerData> get errorMarkerStream => errorMarkerController.stream;
  Stream<int> get timeUpdateStream => _timeUpdateController.stream;
  Stream<List<String>> get cheatDataStream => cheatDataController.stream;
  Stream<bool> get navigateToGameScreenStream =>
      _navigateToGameScreenController.stream;
  Stream<DifferenceImages> get differenceFoundStream =>
      differenceFoundController.stream;
  Stream<List<String?>> get cheatStream => cheatController.stream;
  //Stream<int> get removeCheatStream => removeCheatController.stream;
  Stream<bool> get showErrorStream => showErrorController.stream;
  Stream<List<String>> get nextCardOgStream => _nextCardOgController.stream;
  Stream<List<String>> get nextCardNewStream => _nextCardNewController.stream;

  GameDataService gameData = GameDataService();

  bool _isCheating = false;

  CommunicationSocket socketService = CommunicationSocket.instance;

  bool get cheating => _isCheating;

  set cheating(bool value) {
    if (canCheat) {
      getReplayService().doAndStore('cheatingValue', value as ReplayInput);
      _isCheating = value;
    }
  }

  void initializeReplayListener() {
    _replayActionSubscription?.cancel();
    _replayActionSubscription =
        getReplayService().replayActionTriggered.listen((action) {
      //print("action.input: ${action.input}");
      switch (action.category) {
        case 'cheatingValue':
          if (action.input is ReplayInput<bool>) {
            _isCheating = (action.input as ReplayInput<bool>).value;
          } else {
            //print(
            //  'Unexpected data type for cheatingValue. Expected ReplayInput<bool>.');
          }
          break;
        case 'incrementPersonalDifference':
          if (action.input is ReplayInput<String>) {
            String playerName = (action.input as ReplayInput<String>).value;
            incrementUserScore(playerName);
          } else {
            String playerName =
                (action.input as ReplayInput<dynamic>).value.toString();
            incrementUserScore(playerName);
          }
          break;
        case 'showError':
          showError();

          break;
        case 'processClickOpponentResponse':
          //print(action.input.value);
          if (action.input.value is GameClickOutputDto) {
            processClickOpponentResponse(
                action.input.value as GameClickOutputDto);
          }
          if (action.input.value is Map) {
            processClickOpponentResponse(GameClickOutputDto.fromJson(
                action.input.value as Map<String, dynamic>));
          } else {
            //print('Unexpected data type for action.input');
          }
          break;
        case 'endOfReplay':
          getReplayService().endOfReplay();
          break;
        case 'flashCheatImages':
          cheatData = action.input.value as List<String>;
          //print(action.input.value);
          cheatDataController.add(cheatData);
          break;
        case 'setLastClickArea':
          if (action.input.value is Map) {
            var coordinates = action.input.value as Map<String, dynamic>;

            setLastClickArea(
                coordinates['x'].toInt(), coordinates['y'].toInt());
          } else if (action.input.value is List<double>) {
            var coordinates = action.input.value as List<double>;

            setLastClickArea(coordinates[0].toInt(), coordinates[1].toInt());
          } else {
            var coordinates = action.input.value as List<dynamic>;

            setLastClickArea(coordinates[0].toInt(), coordinates[1].toInt());
          }
          break;
        default:
          //print('Unrecognized action category: ${action.category}');
          break;
      }
    });
  }

  void closeStreams() {
    //To make sure that there is no duplicate streams or a stream that wasnt closed for xy reasons
    _replayActionSubscription?.cancel();
    _playerInfoController?.close();
    differenceOverlayController?.close();
    _gameEndController?.close();
    flickerEventController?.close();
    errorMarkerController?.close();
    _timeUpdateController?.close();
    cheatDataController?.close();
    _navigateToGameScreenController?.close();
    differenceFoundController?.close();
    cheatController?.close();
    showErrorController?.close();
    _nextCardOgController?.close();
    _nextCardNewController?.close();
    _gameNameController?.close();
    _observerNbrController?.close();
    _nbrDifferenceController?.close();
  }

  void initStreams() {
    closeStreams();
    StreamSubscription<ReplayAction> _replayActionSubscription;
    _playerInfoController = StreamController<List<PlayerInfo>>.broadcast();
    differenceOverlayController = StreamController<String>.broadcast();
    _gameEndController = StreamController<dynamic>.broadcast();
    flickerEventController = StreamController<String>.broadcast();
    errorMarkerController = StreamController<ErrorMarkerData>.broadcast();
    _timeUpdateController = StreamController<int>.broadcast();
    cheatDataController = StreamController<List<String>>.broadcast();
    _navigateToGameScreenController = StreamController<bool>.broadcast();
    differenceFoundController = StreamController<DifferenceImages>.broadcast();
    cheatController = StreamController<List<String?>>.broadcast();
    // removeCheatController = StreamController<int>.broadcast();
    showErrorController = StreamController<bool>.broadcast();
    _nextCardOgController = StreamController<List<String>>.broadcast();
    _nextCardNewController = StreamController<List<String>>.broadcast();
    _gameNameController = StreamController<List<String>>.broadcast();
    _observerNbrController = StreamController<int>.broadcast();
    _nbrDifferenceController = StreamController<List<int>>.broadcast();
  }

  Future<void> init() async {
    if (!gameData.isGameStarted) {
      //To make sure that there is no duplicate listeners
      removeListener();
      initStreams();

      initializeReplayListener();

      CommunicationSocket.on(FromServer.RESPONSE_TO_JOIN_GAME_REQUEST,
          (data) async {
        limitedTimeSingleplayer(data);
        gameID = data["gameId"];

        if (data["canCheat"] != null) {
          GameDataService().isCheatAllowed = data["canCheat"];
        }
      });

      CommunicationSocket.on(FromServer.OBSERVER_LIST, (data) {
        _observerNbrController.add(List<String>.from(data).length);
      });

      CommunicationSocket.instance.send(ToServer.IS_PLAYING);
      gameMode = gameData.gameMode;
      gameValues = gameData.gameValues;
      time = gameData.chronometerTime;
      gameID = gameData.gameID;
      totalDifferences = gameData.differenceNbr;
      currentUsername = gameData.name;
      gameName = gameData.gameName;

      CommunicationSocket.on(FromServer.CLICK_PERSONAL, (data) async {
        if (data['valid'] == true) {
          updateCards();
          String playerName = AuthService.instance.username;
          ReplayInput<String> playerNameReplayInput = ReplayInput<String>(
            value: playerName,
          );
          if (gameMode == GameMode.ClassicDeathMatch) {
            print("HEREEEE");
            print(data);
            ReplayInput<DifferenceImages> differenceOverlay =
                ReplayInput<DifferenceImages>(
              value: DifferenceImages(
                differenceNaturalOverlay: data['differenceNaturalOverlay'],
                differenceFlashOverlay: data['differenceFlashOverlay'],
              ),
            );

            getReplayService().doAndStore('showSuccess', differenceOverlay);
          }

          getReplayService()
              .doAndStore('incrementPersonalDifference', playerNameReplayInput);
        }
        if (data['valid'] == false && data['playerName'] == null) {
          processError(globalX.toDouble(), globalY.toDouble());
        }
      });

      CommunicationSocket.on(FromServer.CLICK_ENEMY, (data) async {
        if (data['valid'] == false) {
          return;
        }

        GameClickOutputDto extractedData;

        if (data['valid'] == true) {
          if (GameDataService().gameMode == GameMode.LimitedTimeDeathMatch) {
            updateCards();
            extractedData = GameClickOutputDto(
              valid: data['valid'],
              playerName: data['playerName'],
              penaltyTime: data?['penaltyTime'],
            );
          } else {
            extractedData = GameClickOutputDto(
              valid: data['valid'],
              playerName: data['playerName'],
              penaltyTime: data?['penaltyTime'],
              differenceNaturalOverlay: data?['differenceNaturalOverlay'],
              differenceFlashOverlay: data?['differenceFlashOverlay'],
            );
          }
          ReplayInput<GameClickOutputDto> replayInput =
              ReplayInput<GameClickOutputDto>(value: extractedData);
          getReplayService()
              .doAndStore('processClickOpponentResponse', replayInput);
        }
      });

      CommunicationSocket.on(FromServer.SOUNDBOARD, (data) async {
        SoundService().playSound(data == 'Yippee' ? Sound.Yippee : Sound.Boiii);
      });

      CommunicationSocket.on(FromServer.ENDGAME, (data) async {
        final gameEndData = GameEndData.fromJson(data);
        emitGameEnd(gameEndData);
        cheatDataController.add([]);
        //GameDataService().showCheat = false;

        //_gameEndController.add(gameEndData);
      });

      CommunicationSocket.on(FromServer.TIME, (data) async {
        double time = double.parse(data.toString());
        this.time = time;
        int roundedTime = time.round();
        recordedTimes.add(time);
        _timeUpdateController.add(roundedTime);
      });

      userName2ndPlayer = gameData.name2ndPlayer;

      CommunicationSocket.on(FromServer.CHEAT, (data) {
        List<String> dataListString = (data as List<dynamic>)
            .map((item) => item as String?)
            .whereType<String>()
            .toList();
        ReplayInput<List<String>> replayInput = ReplayInput<List<String>>(
          value: dataListString,
        );
        getReplayService().doAndStore('flashCheatImages', replayInput);
        //cheatDataController.add(dataListString);
      });

      CommunicationSocket.on(FromServer.NEXT_CARD, (data) async {
        gameData.gameName = data['name'];
        originalImageLimited.add(data['originalImage']);
        modifiedImageLimited.add(data['modifiedImage']);

        gameNameList.add(data["name"]);
        nbDifferencesList.add(data["nbDifferences"]);
      });

      gameData.isGameStarted = true;
    }
  }

  void emitGameEnd(GameEndData data) {
    lastGameEndData = data;
    hasGameEnded = true;
    _gameEndController.sink.add(data);
  }

  void clearGameEndData() {
    lastGameEndData = null;
    hasGameEnded = false;
  }

  void showErrorMessage() {
    showErrorController.add(true);

    DelayService().wait(PENALITY_DURATION).then((value) {
      showErrorController.add(false);
    });
    // Future.delayed(const Duration(seconds: 1), () {
    //   showErrorController.add(false);
    // });
  }

  void processClickOpponentResponse(GameClickOutputDto data) {
    if (data.valid) {
      ReplayInput<String> playerName = ReplayInput<String>(
        value: data.playerName,
      );

      if (!getReplayService().isReplayMode) {
        getReplayService()
            .doAndStore('incrementPersonalDifference', playerName);
      }

      processEnemySuccess(DifferenceImages(
        differenceNaturalOverlay: data.differenceNaturalOverlay as String,
        differenceFlashOverlay: data.differenceFlashOverlay as String,
      ));
    }
  }

  void AlertStream(var List, var Controller) {
    if (List.isNotEmpty) {
      List.removeAt(0);
      if (List.isNotEmpty) {
        Controller.add(List);
      }
    }
  }

  void showSuccess(DifferenceImages data) async {
    if (data.differenceFlashOverlay != null &&
        data.differenceNaturalOverlay != null &&
        gameMode == GameMode.ClassicDeathMatch) {
      updateImage(data);
    }
  }

  void updateCards() async {
    if (gameMode == GameMode.LimitedTimeDeathMatch) {
      GameDataService().showCheat = false;
      _soundService.playSuccess();
      AlertStream(originalImageLimited, _nextCardOgController);
      AlertStream(modifiedImageLimited, _nextCardNewController);
      AlertStream(gameNameList, _gameNameController);
      AlertStream(nbDifferencesList, _nbrDifferenceController);
    }
  }

  void incrementUserScore(String username) {
    gameData.playersInfo.forEach((element) {
      if (element.username == username) {
        element.score++;
        //print(GameDataService().playersInfo);
      }
    });
    _playerInfoController.add(GameDataService().playersInfo);
  }

  processEnemySuccess(DifferenceImages data) {
    updateCards();
    if (data.differenceFlashOverlay != null &&
        data.differenceNaturalOverlay != null &&
        gameMode == GameMode.ClassicDeathMatch) {
      updateImage(data);
    }
  }

  //BUG: When you start the replay mode and you you have made an error at some point in the gamescreen
  //// the error marker will only appear on the last click that was valid
  void processError(double posX, double posY) {
    getClicks.add([globalX.toDouble(), globalY.toDouble()]);

    ReplayInput<List<List<double>>> replayInput =
        ReplayInput<List<List<double>>>(value: getClicks);
    getReplayService().doAction('showError', replayInput);
    getReplayService().store('showError', replayInput); // TODO
    //showErrorMessage();
  }

  List<List<double>> getClicks = [];

  void showError() {
    _soundService.playError();
    errorMarkerController.add(ErrorMarkerData(
        posX: globalX.toDouble(), posY: globalY.toDouble(), isVisible: true));

    Future.delayed(const Duration(seconds: 1), () {
      errorMarkerController.add(ErrorMarkerData(
          posX: globalX.toDouble(),
          posY: globalY.toDouble(),
          isVisible: false));
    });
  }

  Future<void> limitedTimeSingleplayer(dynamic data) async {
    if (data['responseType'] == 0) {
      _navigateToGameScreenController.add(true);
      gameData.alreadyFoundDifferences = [];
      GameDataService().isObserver = false;
      originalImageLimited = [];
      modifiedImageLimited = [];
      gameNameList = [];
      nbDifferencesList = [];
      GameDataService().observerNbr = 0;
      startGame(data);
    }
  }

  Future<void> observe(
      dynamic data, List<dynamic> differencesFound, int observerNbr) async {
    _navigateToGameScreenController.add(true);
    gameData.alreadyFoundDifferences = differencesFound;
    GameDataService().isObserver = true;
    GameDataService().observerNbr = observerNbr;
    startGame(data);
  }

  void sendSoundToServer(Sound sound) {
    //("sending sound");
    final soundToSend = {
      'gameId': GameDataService().observerGameID,
      'sound': sound.toString().split('.').last
    };
    CommunicationSocket().send("soundboard", soundToSend);
  }

  void startGame(dynamic data) {
    if (data["originalImage"] != null && data["modifiedImage"] != null) {
      originalImageLimited.insert(0, data["originalImage"]);
      modifiedImageLimited.insert(0, data["modifiedImage"]);
    }

    if (data["gameName"] != null && data["differenceNbr"] != null) {
      gameNameList.insert(0, data["gameName"]);
      nbDifferencesList.insert(0, data["differenceNbr"]);
    }

    String gameDifficulty = '';
    if (data['difficulty'] == 0) {
      gameDifficulty = 'facile';
    } else if (data['difficulty'] == 1) {
      gameDifficulty = 'difficile';
    }

    gameData.timeToStart = data["startingIn"];
    gameData.chronoTime = data["time"];
    if (gameData.isObserver) {
      gameData.gameID = gameData.observerGameID;
    } else {
      gameData.gameID = data["gameId"];
    }

    //gameData.gameID = data["gameId"];
    gameData.nbOfPlayers = data["playerNbr"];
    gameData.differenceNbr = data["differenceNbr"];
    gameData.difficulty = data["difficulty"];
    gameData.name = data["hostName"];
    gameData.gameName = data["gameName"];
    gameData.name2ndPlayer = "";
    gameData.gameValues.timerTime = data["gameValues"]['timerTime'].toString();
    gameData.gameValues.gainedTime =
        data["gameValues"]['gainedTime'].toString();
  }

  void requestServerCheck(int x, int y, int globalX, int globalY) {
    final clickMessage = {
      'gameId': gameData.gameID,
      'x': x,
      'y': y,
    };
    // transform to replayInput the coordinates
    ReplayInput<List<double>> replayInputClick = ReplayInput<List<double>>(
      value: [globalX.toDouble(), globalY.toDouble()],
    );

    getReplayService().doAndStore('setLastClickArea', replayInputClick);
    socketService.send(ToServer.CLICK, clickMessage);
    positionX = x;
    positionY = y;
    this.globalX = globalX;
    this.globalY = globalY;
  }

  //TODO: CONVERTION
  void setLastClickArea(int x, int y) {
    // positionX = x;
    // positionY = y;
    globalX = x;
    globalY = y;
  }

  void dispose() {
    MessageService.instance.removeGamingChannel();
    differenceOverlayController.close();
    _gameEndController.close();
    flickerEventController.close();
    errorMarkerController.close();
    _timeUpdateController.close();
    cheatDataController.close();
    differenceFoundController.close();
    cheatController.close();
    showErrorController.close();
    _playerInfoController.close();
    _gameNameController.close();
    _observerNbrController.close();
    _nbrDifferenceController.close();
    _navigateToGameScreenController.close();
    _replayActionSubscription?.cancel();
    GameDataService().showCheat = false;
    // _isDisposed = true;
  }

  void abandonGame() {
    GameDataService().showCheat = false;
    playerAbandoned = true;
    gameData.isGameStarted = false;
    socketService.send(ToServer.LEAVE_GAME, gameData.gameID);
    getReplayService().isReplayingReplay = false;
    removeListener();
  }

  void removeListener() {
    if (!getReplayService().isReplayingReplay) {
      getReplayService().isReplayMode = false;
    }
    CommunicationSocket.removeListener(FromServer.PLAYER_STATUS);
    CommunicationSocket.removeListener(FromServer.ENDGAME);
    CommunicationSocket.removeListener(FromServer.CHEAT);
    CommunicationSocket.removeListener(FromServer.CLICK_ENEMY);
    CommunicationSocket.removeListener(FromServer.CLICK_PERSONAL);
    CommunicationSocket.removeListener(FromServer.NEXT_CARD);
    CommunicationSocket.removeListener(FromServer.CHEAT_INDEX);
    CommunicationSocket.removeListener(FromServer.TIME);
    CommunicationSocket.removeListener(
        FromServer.RESPONSE_TO_JOIN_GAME_REQUEST);
    CommunicationSocket.removeListener(FromServer.SOUNDBOARD);
  }
}
