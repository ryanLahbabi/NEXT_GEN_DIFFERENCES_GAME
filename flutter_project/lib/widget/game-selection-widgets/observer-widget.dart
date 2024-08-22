import 'package:flutter/material.dart';
import 'package:flutter_project/classes/communication-socket.dart';
import 'package:flutter_project/classes/gamePlay/player-info.dart';
import 'package:flutter_project/common/enum.dart';
import 'package:flutter_project/common/socket-event-constants.dart';
import 'package:flutter_project/pages/game-screen.dart';
import 'package:flutter_project/service/game-data-service.dart';
import 'package:flutter_project/service/game-list-manager-service.dart';
import 'package:flutter_project/service/game-service.dart';
import 'package:flutter_project/service/message-service.dart';
import 'package:flutter_project/widget/game-selection-widgets/game-cards-widget.dart';
import 'package:flutter_project/widget/game-selection-widgets/top-bar-widget.dart';
import 'package:flutter_project/widget/message-widget.dart';
import 'package:flutter_project/widget/tools-widgets/frame-widget.dart';
import 'package:flutter_project/widget/tools-widgets/title-widget.dart';

import '../../classes/applocalization.dart';
import '../../dtos/cards-dto.dart';
import '../../dtos/channel-dto.dart';
import '../../service/settings-service.dart';

class ObserverWidget extends StatefulWidget {
  final bool isTimed;

  const ObserverWidget({required this.isTimed, super.key});

  @override
  _ObserverWidget createState() => _ObserverWidget();
}

class _ObserverWidget extends State<ObserverWidget> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    GameListManagerService.cardStream.listen((event) {
      if (mounted) {
        setState(() {});
      }
    });

    GameService.instance.init();
    GameDataService().isGameStarted = false;
    GameService.instance.navigateToGameScreenStream.listen((navigate) {
      if (navigate) {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => GameScreen()),
        );
      }
    });

    CommunicationSocket.on(FromServer.JOIN_OBSERVER, (gameData) {
      MessageService.instance.addGamingChannel(gameData['data']['gameId']);
      List<dynamic> membersList = gameData['data']['players'];
      List<PlayerInfo> updatedPlayersInfo = membersList.map((member) {
        return PlayerInfo(
            username: member["name"].toString(), score: member["score"]);
      }).toList();
      GameDataService().playersInfo = updatedPlayersInfo;
      GameDataService().observerGameID = gameData['data']['gameId'];
      dynamic data = {
        'gameName': gameData['data']['cards'][0]['name'],
        'playerNbr': gameData['data']['players'].length,
        'startingIn': 0,
        'originalImage': gameData['data']['cards'][0]['originalImage'],
        'modifiedImage': gameData['data']['cards'][0]['modifiedImage'],
        'time': gameData['data']['time'],
        'gameId': gameData['data']['gameId'],
        'difficulty': gameData['data']['cards'][0]['difficulty'],
        'differenceNbr': gameData['data']['cards'][0]['nbDifferences'],
        'hostName': '',
        'gameValues': gameData['data']['gameValues'],
        'members': gameData['data']['players'].map((p) => p.name),
      };
      if ((gameData['data']['cards'] as List).length > 1) {
        GameService.instance.originalImageLimited = [
          gameData['data']['cards'][1]['originalImage']
        ];
        GameService.instance.modifiedImageLimited = [
          gameData['data']['cards'][1]['modifiedImage']
        ];
        GameService.instance.gameNameList = [
          gameData['data']['cards'][1]["name"]
        ];
        GameService.instance.nbDifferencesList = [
          gameData['data']['cards'][1]["nbDifferences"]
        ];
      }
      GameService.instance.observe(
        data,
        gameData['data']['foundDifferences'],
        gameData['data']['observerNbr'],
      );
    });
  }

  @override
  void dispose() {
    CommunicationSocket.removeListener("join_observer");
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    return Scaffold(
      resizeToAvoidBottomInset: false,
      drawer: const MessageWidget(),
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage(
              SettingsService.instance.theme == Themes.dark
                  ? 'assets/dark_background.png'
                  : 'assets/Postboard_background.png',
            ),
            fit: BoxFit.cover,
          ),
        ),
        child: Column(
          children: [
            Stack(
              children: [
                Positioned(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 25.0),
                    child: Container(
                      width: 1300,
                      height: 60,
                      child: widget.isTimed
                          ? CustomPaperWidget(
                              text: appLocalizations
                                      .translate('SELECTION_TIME_LIMITED') ??
                                  '',
                            )
                          : CustomPaperWidget(
                              text: appLocalizations
                                      .translate('SELECTION_CLASSIC_GAME') ??
                                  '',
                            ),
                    ),
                  ),
                ),
                Positioned(
                  top: 35,
                  right: 100,
                  child: Builder(
                    builder: (BuildContext context) {
                      return GestureDetector(
                        onTap: () {
                          Scaffold.of(context).openDrawer();
                          MessageService.instance.markMessagesAsRead(
                              MessageService.instance.focusedConversationId);
                        },
                        child: Stack(
                          children: <Widget>[
                            Icon(
                              Icons.message_outlined,
                              size: 40,
                              color:
                                  SettingsService.instance.theme == Themes.dark
                                      ? Colors.white
                                      : Color.fromARGB(255, 49, 49, 49),
                            ),
                            Positioned(
                              top: 0,
                              right: 0,
                              child: ValueListenableBuilder<bool>(
                                valueListenable:
                                    MessageService.instance.hasUnreadMessage,
                                builder: (context, hasUnread, child) {
                                  return hasUnread
                                      ? Container(
                                          width: 18,
                                          height: 18,
                                          decoration: BoxDecoration(
                                            color: Colors.red,
                                            shape: BoxShape.circle,
                                            border: Border.all(
                                                color: Colors.white, width: 1),
                                          ),
                                        )
                                      : Container();
                                },
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
            TopBarWidget(
              isTimed: widget.isTimed,
            ),
            Stack(
              alignment: Alignment.center,
              children: [
                FrameWidget(
                  type: 'observer',
                  child: Column(
                    children: [
                      Expanded(
                        flex: 1,
                        child: ScrollbarTheme(
                          data: ScrollbarThemeData(
                            thumbColor: MaterialStateProperty.all(
                                const Color.fromARGB(255, 218, 128, 226)),
                            thickness: MaterialStateProperty.all(15.0),
                            radius: const Radius.circular(5),
                            crossAxisMargin: 2.5,
                            mainAxisMargin: 5.0,
                          ),
                          child: Scrollbar(
                            controller: _scrollController,
                            thumbVisibility: true,
                            child: widget.isTimed
                                ? GridView.count(
                                    controller: _scrollController,
                                    padding: const EdgeInsets.only(right: 30),
                                    crossAxisCount: 3,
                                    childAspectRatio: 1.7,
                                    crossAxisSpacing: 10,
                                    mainAxisSpacing: 12,
                                    children: GameListManagerService
                                        .instance.ongoingGames
                                        .where((element) =>
                                            element.gameMode ==
                                            GameMode.LimitedTimeDeathMatch)
                                        .map((e) => GameCardWidget(
                                              observerNbr: e.observerNbr,
                                              gameMode: 5,
                                              cardID: e.cardId,
                                              gameID: e.gameID,
                                              name: e.name.toString(),
                                              image: e.originalImage.toString(),
                                              difficulty:
                                                  e.difficulty.toString(),
                                              awaitingPlayers:
                                                  e.awaitingPlayers,
                                              type: 'observer',
                                              sendSelection: () {},
                                              isTimed: true,
                                              nbDifferences:
                                                  e.nbDifferences?.toInt(),

                                            ))
                                        .toList(),
                                  )
                                : GridView.count(
                                    controller: _scrollController,
                                    padding: const EdgeInsets.only(right: 100),
                                    crossAxisCount: 2,
                                    childAspectRatio: 2.1,
                                    crossAxisSpacing: 110,
                                    mainAxisSpacing: 12,
                                    children: GameListManagerService
                                        .instance.ongoingGames
                                        .where((element) =>
                                            element.gameMode ==
                                            GameMode.ClassicDeathMatch)
                                        .map((e) => GameCardWidget(
                                              observerNbr: e.observerNbr,
                                              gameMode: 4,
                                              cardID: e.cardId,
                                              gameID: e.gameID,
                                              name: e.name.toString(),
                                              image: e.originalImage.toString(),
                                              difficulty:
                                                  e.difficulty.toString(),
                                              awaitingPlayers:
                                                  e.awaitingPlayers,
                                              type: 'observer',
                                              sendSelection: () {},
                                              isTimed: false,
                                              nbDifferences:
                                                  e.nbDifferences?.toInt(),
                                  //            gameAccessType:
                                  //                GameAccessType.Everyone,
                                            ))
                                        .toList(),
                                  ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
