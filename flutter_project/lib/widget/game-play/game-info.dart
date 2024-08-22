import 'package:flutter/material.dart';
import 'package:flutter_project/classes/gamePlay/player-info.dart';
import 'package:flutter_project/common/enum.dart';
import 'package:flutter_project/pages/main-page.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:flutter_project/service/game-data-service.dart';
import 'package:flutter_project/service/game-service.dart';
import 'package:flutter_project/widget/game-play/interaction_menu.dart';
import 'package:flutter_project/widget/game-play/timer-display.dart';

import '../../classes/applocalization.dart';

class GameInfoWidget extends StatefulWidget {
  @override
  _GameInfoWidgetState createState() => _GameInfoWidgetState();
}

class _GameInfoWidgetState extends State<GameInfoWidget> {
  String gameName = GameDataService().gameName;
  String differenceNbr = GameDataService().differenceNbr.toString();
  int observerNbr = GameDataService().observerNbr;

  @override
  void initState() {
    super.initState();
    GameService().gameNameStream.listen((gameName) {
      if (gameName.isNotEmpty) {
        setState(() {
          this.gameName = gameName[0];
        });
      }
    });

    GameService().observerNbrStream.listen((nb) {
      setState(() {
        this.observerNbr = nb;
      });
    });

    GameService().nbrDifferenceStream.listen((nbDifferences) {
      if (nbDifferences.isEmpty) {
        return;
      }
      setState(() {
        this.differenceNbr = nbDifferences[0].toString();
      });
    });
  }

  String getGameMode(GameMode gameMode) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    if (gameMode == GameMode.ClassicDeathMatch) {
      return appLocalizations.translate('MAIN_CLASSIC') ?? '';
    } else if (gameMode == GameMode.LimitedTimeDeathMatch) {
      return appLocalizations.translate('MAIN_LIMITED') ?? '';
    }
    return "";
  }

  String getDifficulty(int difficulty) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    if (difficulty == 0) {
      return appLocalizations.translate('EASY') ?? '';
    } else if (difficulty == 1) {
      return appLocalizations.translate('HARD') ?? '';
    }
    return "";
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    return Container(
      width: 325,
      height: 115,
      padding: const EdgeInsets.all(10.0),
      decoration: BoxDecoration(
        color: Colors.pink.shade300,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            spreadRadius: 0,
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
        border: Border.all(
          color: Colors.black,
          width: 1.0,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (GameDataService().gameMode == GameMode.ClassicDeathMatch)
            Expanded(
              flex: 4,
              child: Text(
                '$gameName\n${getGameMode(GameDataService().gameMode)} \n${getDifficulty(GameDataService().difficulty)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          if (GameDataService().gameMode == GameMode.LimitedTimeDeathMatch)
            Expanded(
              flex: 4,
              child: Text(
                '$gameName\n${getGameMode(GameDataService().gameMode)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          Expanded(
            flex: 6,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Text(
                    (appLocalizations.translate('TOTAL_DIFFERENCES') ?? '') +
                        ': $differenceNbr',
                    style: const TextStyle(color: Colors.white)),
                Text(
                    (appLocalizations.translate('TIME_REMAINING') ?? '') +
                        ': ${GameDataService().gameValues.timerTime}',
                    style: const TextStyle(color: Colors.white)),
                Text(
                    (appLocalizations.translate('OBSERVATORS_NUMBER') ?? '') +
                        ': $observerNbr',
                    style: const TextStyle(color: Colors.white)),
              ],
            ),
          )
        ],
      ),
    );
  }
}

class BlueRectangleWidget extends StatefulWidget {
  final Stream<int> timerStream;

  BlueRectangleWidget({Key? key, required this.timerStream}) : super(key: key);

  @override
  _BlueRectangleWidgetState createState() => _BlueRectangleWidgetState();
}

class _BlueRectangleWidgetState extends State<BlueRectangleWidget> {
  List<PlayerInfo> playersInfo = GameDataService().playersInfo;
  final String currentUsername = AuthService.instance.username;

  final List<Color> colors = [
    Colors.green,
    Colors.pink,
    Colors.purple,
    Colors.orange,
  ];

  @override
  void initState() {
    super.initState();

    widget.timerStream.listen((time) {});

    GameService.instance.playerInfoStream.listen((UpdatedplayersInfo) {
      if (mounted) {
        setState(() {
          playersInfo = UpdatedplayersInfo;
        });
      }
    });
  }

  List<String> ListOfPlayerNames(List<PlayerInfo> playersInfo) {
    return playersInfo.map((playerInfo) => playerInfo.username).toList();
  }

  List<PlayerInfo> filterUniquePlayers(List<PlayerInfo> playersInfo) {
    var uniquePlayersMap = <String, PlayerInfo>{};

    for (var player in playersInfo) {
      uniquePlayersMap[player.username] = player;
    }

    return uniquePlayersMap.values.toList();
  }

  String formatScore() {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    if (GameDataService().gameMode == GameMode.LimitedTimeDeathMatch) {
      return appLocalizations.translate('FOUND') ?? '';
    } else {
      int nbDifferences = GameDataService().differenceNbr;
      int resultDifferences = (nbDifferences) ~/ 2 + 1;
      return "/ ${resultDifferences}";
    }
  }

  @override
  Widget build(BuildContext context) {
    final List<PlayerInfo> uniquePlayersInfo =
        filterUniquePlayers(GameDataService().playersInfo);
    GameDataService().playersInfo = uniquePlayersInfo;
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    final List<String> playerNames = ListOfPlayerNames(uniquePlayersInfo);

    int playersInFirstColumn = playerNames.length > 2 ? 2 : playerNames.length;
    int totalScore =
        uniquePlayersInfo.fold(0, (int sum, player) => sum + player.score);
    GameDataService().totalScore = totalScore;

    return Container(
      width: 950,
      height: 115,
      margin: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        color: Colors.blue,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.black, width: 1),
      ),
      child: Row(
        children: [
          if (GameDataService().isObserver)
            Expanded(
              flex: 5,
              child: InteractionMenu(playerNames: playerNames),
            ),
          Expanded(
            child: Column(
              children: [
                const SizedBox(height: 35),
                const Icon(Icons.timer, color: Colors.white, size: 30),
                const SizedBox(height: 4),
                TimerDisplayWidget(timerStream: widget.timerStream),
              ],
            ),
          ),
          if (GameDataService().gameMode == GameMode.LimitedTimeDeathMatch)
            Expanded(
              flex: GameDataService().isObserver ? 4 : 2,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Container(
                    width: 200,
                    height: 33,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12.0, vertical: 8.0),
                    margin: const EdgeInsets.symmetric(vertical: 4.0),
                    decoration: BoxDecoration(
                      color: Colors.green,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      "Différences trouvées: $totalScore",
                      style: const TextStyle(color: Colors.white),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
              ),
            ),
          if (GameDataService().gameMode == GameMode.ClassicDeathMatch)
            Expanded(
              flex: GameDataService().isObserver ? 4 : 2,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: List.generate(playersInFirstColumn, (index) {
                  String playerName = playerNames[index];
                  bool isCurrentUser = playerName == currentUsername;
                  Color color = isCurrentUser
                      ? Colors.green
                      : colors[index % colors.length];
                  int score = uniquePlayersInfo
                      .firstWhere((player) => player.username == playerName)
                      .score;
                  GameDataService().totalScore = uniquePlayersInfo.fold(
                      0, (int sum, player) => sum + player.score);

                  int nbDifferences = GameDataService().differenceNbr;
                  int resultDifferences = (nbDifferences + 1) ~/ 2;

                  return Container(
                    width: 200,
                    height: 33,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12.0, vertical: 8.0),
                    margin: const EdgeInsets.symmetric(vertical: 4.0),
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      "$playerName  -  $score ${formatScore()}",
                      style: const TextStyle(color: Colors.white),
                      textAlign: TextAlign.center,
                    ),
                  );
                }),
              ),
            ),
          if (playerNames.length > 2)
            if (GameDataService().gameMode == GameMode.ClassicDeathMatch)
              Expanded(
                flex: GameDataService().isObserver ? 4 : 2,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: List.generate(
                      playerNames.length > 3 ? playerNames.length - 2 : 2,
                      (index) {
                    if (playerNames.length == 3 && index == 1) {
                      return Container(
                        width: 200,
                        height: 33,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12.0, vertical: 8.0),
                        margin: const EdgeInsets.symmetric(vertical: 4.0),
                      );
                    } else {
                      int actualIndex = index + 2;
                      if (actualIndex < playerNames.length) {
                        String playerName = playerNames[actualIndex];
                        bool isCurrentUser = playerName == currentUsername;
                        Color color = isCurrentUser
                            ? Colors.green
                            : colors[actualIndex % colors.length];
                        int score = uniquePlayersInfo
                            .firstWhere(
                                (player) => player.username == playerName)
                            .score;
                        int nbDifferences = GameDataService().differenceNbr;
                        int resultDifferences = (nbDifferences + 1) ~/ 2;

                        return Container(
                          width: 200,
                          height: 33,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12.0, vertical: 8.0),
                          margin: const EdgeInsets.symmetric(vertical: 4.0),
                          decoration: BoxDecoration(
                            color: color,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            "$playerName - $score ${formatScore()}",
                            style: const TextStyle(color: Colors.white),
                            textAlign: TextAlign.center,
                          ),
                        );
                      } else {
                        return Container();
                      }
                    }
                  }),
                ),
              ),
          Expanded(
            flex: 3,
            child: Stack(
              alignment: Alignment.topCenter,
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                        GameService.instance.getReplayService().isReplayMode
                            ? Color.fromARGB(255, 124, 124, 124)
                            : Colors.red,
                    shape: const RoundedRectangleBorder(
                      borderRadius: BorderRadius.zero,
                    ),
                    fixedSize:
                        Size(GameDataService().isObserver ? 150 : 200, 60),
                  ),
                  onPressed: () {
                    if (!GameService.instance.getReplayService().isReplayMode) {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return AlertDialog(
                            title: const Text('Confirmation'),
                            content: Text(
                                appLocalizations.translate('SURE_TO_GIVE_UP') ??
                                    ''),
                            actions: <Widget>[
                              TextButton(
                                onPressed: () {
                                  GameService.instance.abandonGame();
                                  GameService.instance.dispose();
                                  Navigator.of(context).pushReplacement(
                                    MaterialPageRoute(
                                        builder: (context) => const MainPage()),
                                  );
                                },
                                child: Text(
                                    appLocalizations.translate('YES') ?? ''),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                                child: Text(
                                    appLocalizations.translate('NO') ?? ''),
                              ),
                            ],
                          );
                        },
                      );
                    }
                  },
                  child: Text(
                      GameDataService().isObserver
                          ? appLocalizations.translate('QUIT') ?? ''
                          : appLocalizations.translate('GIVE_UP') ?? '',
                      style: TextStyle(color: Colors.white, fontSize: 18)),
                ),
                Positioned(
                  top: 1,
                  child: Image.asset(
                    'assets/push_pin.png',
                    width: 15,
                    height: 15,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String formatTime(int timeInSeconds) {
    final minutes = (timeInSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (timeInSeconds % 60).toString().padLeft(2, '0');
    return "$minutes:$seconds";
  }
}
