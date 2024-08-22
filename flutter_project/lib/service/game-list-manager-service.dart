import 'dart:async';

import 'package:flutter_project/classes/communication-socket.dart';
import 'package:flutter_project/common/enum.dart';
import 'package:flutter_project/common/socket-event-constants.dart';
import 'package:flutter_project/dtos/cards-dto.dart';

class GameListManagerService {
  static final StreamController _cardController = StreamController.broadcast();
  static Stream get cardStream => _cardController.stream;

  static final GameListManagerService _instance =
      GameListManagerService._internal();
  final CommunicationSocket communicationSocket = CommunicationSocket.instance;
  List<Game> games = [];
  List<Game> joinableGames = [];
  List<Game> ongoingGames = [];
  String gameID = "NOPE";
  GameAccessType accessType = GameAccessType.Everyone;


  bool _initialized = false;

  GameListManagerService._internal();

  static GameListManagerService get instance => _instance;

  Future<void> init() async {
    CommunicationSocket.instance.send(ToServer.ALL_GAME_CARDS);
    CommunicationSocket.on(FromServer.ALL_GAME_CARDS, (gamesData) {
      games.clear();
      CommunicationSocket.instance.send(ToServer.JOINABLE_GAME_CARDS);
      CommunicationSocket.instance.send(ToServer.ONGOING_GAMES);

      for (var gameData in gamesData) {
        games.add(Game.fromjson(gameData));
      }
    });

    CommunicationSocket.on(
        FromServer.GAME_CARD, (gameCard) => games.add(Game.fromjson(gameCard)));

    CommunicationSocket.on(FromServer.JOINABLE_GAME_CARDS, (gameData) {
      joinableGames.clear();
      for (var game in gameData) {
        final gameMode = GameMode.values[game["gameMode"]];
        var card = gameMode == GameMode.ClassicDeathMatch
            ? games.firstWhere((element) => element.cardId == game["cardId"])
            : null;
        var newGame = Game(
            gameID: game["id"],
            cardId: game["cardId"],
            name: card?.name,
            difficulty: card?.difficulty,
            originalImage: card?.originalImage,
            nbDifferences: card?.nbDifferences,
            playersWithAccess: List<String>.from(game["playersWithAccess"]),
            awaitingPlayers: List<String>.from(game["waitingPlayers"]));
        newGame.gameMode = gameMode;
        joinableGames.add(newGame);
      }
      _cardController.add(null);
    });

    CommunicationSocket.on(FromServer.ONGOING_GAMES, (gameData) {
      ongoingGames.clear();
      for (var game in gameData) {
        final gameMode = GameMode.values[game["gameMode"]];
        var card = gameMode == GameMode.ClassicDeathMatch
            ? games.firstWhere((element) => element.cardId == game["cardId"])
            : null;

          //This is the stupidest thing I've ever seen - LUCAS
          //NEVER UNCOMMENT THIS
          //---------------------------------------
          /*if (card == null) {
            continue;
          }*/
        //---------------------------------------

        var newGame = Game(
            observerNbr: game["observerNbr"],
            gameID: game["id"],
            cardId: game["cardId"],
            name: card?.name,
            difficulty: card?.difficulty,
            originalImage: card?.originalImage,
            nbDifferences: card?.nbDifferences,
            playersWithAccess: [],
            awaitingPlayers: List<String>.from(game["waitingPlayers"]));
        newGame.gameMode = gameMode;
        ongoingGames.add(newGame);
      }
      _cardController.add(null);
    });

    CommunicationSocket.on(FromServer.UPDATE_ACCESS_TYPE, (body) {
      this.updateAccessType(body);
      gameID = body["gameId"];
      accessType = GameAccessType.values[body["type"]];
      _cardController.add(null);
    });
  }

  GameAccessType accessToEnum(int access) {
    print(access);
    switch (access) {
      case 0:
        return GameAccessType.Everyone;
      case 1:
        return GameAccessType.Friends;
      case 2:
        return GameAccessType.FriendsOfFriends;
      default:
        return GameAccessType.Everyone;
    }
  }


  void updateAccessType(dynamic access) {

    int gameIndex = joinableGames.indexWhere((game) => game.gameID == access["gameId"]);
    if (gameIndex != -1) {
      joinableGames[gameIndex].accessType =  accessToEnum(access["type"]);

    }

  }


}
