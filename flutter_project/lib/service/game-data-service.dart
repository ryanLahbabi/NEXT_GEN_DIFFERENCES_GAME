import 'dart:ui';

import 'package:flutter_project/classes/gamePlay/game-values.dart';
import 'package:flutter_project/classes/gamePlay/player-info.dart';
import 'package:flutter_project/common/enum.dart';

class GameDataService {
  int timeToStart = 0;
  String modifiedPicture = '';
  double chronometerTime = 0;
  String gameID = '';
  int nbOfPlayers = 0;
  String originalPicture = '';
  int differenceNbr = 0;
  int difficulty = 0;
  String name = '';
  GameMode gameMode = GameMode.None;
  String gameName = '';
  String name2ndPlayer = '';
  int chronoTime = 0;
  GameValues gameValues = GameValues();
  bool showCheat = false;
  int persoScore = 0;
  int opponentScore = 0;
  String opponentName = '';
  bool isCheatAllowed = false;
  List<PlayerInfo> playersInfo = [];
  bool isObserver = false;
  int observerNbr = 0;
  List<dynamic> alreadyFoundDifferences = [];
  int totalScore = 0;
  bool isAlreadyFetched = false;
  String observerGameID = '';
  bool isGameFinished = false;
  bool isGameServiceInitialized = false;
  bool isModeReplayReplaying= false;

  List<Image> overlaysReplay = [];

  bool isGameStarted = false;

  GameDataService._privateConstructor();

  static final GameDataService _instance =
      GameDataService._privateConstructor();

  factory GameDataService() {
    return _instance;
  }

  static GameDataService get instance => _instance;
}
