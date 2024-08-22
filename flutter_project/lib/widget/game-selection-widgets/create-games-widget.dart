import 'package:flutter/material.dart';
import 'package:flutter_project/service/game-list-manager-service.dart';
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

class CreateGameWidget extends StatefulWidget {
  const CreateGameWidget({super.key});

  @override
  _CreateGameWidget createState() => _CreateGameWidget();
}

class _CreateGameWidget extends State<CreateGameWidget> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
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
          child: Column(children: [
            Stack(
              children: [
                Positioned(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 25.0),
                    child: Container(
                      width: 1300,
                      height: 60,
                      child: CustomPaperWidget(
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
              isTimed: false,
            ),
            Theme(
              data: Theme.of(context).copyWith(
                scrollbarTheme: ScrollbarThemeData(
                  thumbColor: MaterialStateProperty.all(
                      Color.fromARGB(255, 218, 128, 226)),
                  thickness: MaterialStateProperty.all(15.0),
                  radius: Radius.circular(5),
                  trackVisibility: MaterialStateProperty.all(false),
                  thumbVisibility: MaterialStateProperty.all(true),
                ),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  FrameWidget(
                    type: 'create-games',
                    child: Column(
                      children: [
                        Expanded(
                          flex: 1,
                          child: Scrollbar(
                            //controller: _scrollController,
                            child: GridView.count(
                              padding: const EdgeInsets.only(right: 50),
                              crossAxisCount: 2,
                              childAspectRatio: 2.1,
                              crossAxisSpacing: 80,
                              mainAxisSpacing: 12,
                              children: List.generate(
                                GameListManagerService.instance.games.length,
                                (index) {
                                  return GameCardWidget(
                                    gameMode: 4,
                                    cardID: GameListManagerService
                                        .instance.games[index].cardId,
                                    name: GameListManagerService
                                        .instance.games[index].name
                                        .toString(),
                                    image: GameListManagerService
                                        .instance.games[index].originalImage
                                        .toString(),
                                    difficulty: GameListManagerService
                                        .instance.games[index].difficulty
                                        .toString(),
                                    awaitingPlayers: ['Player 1', 'Player 2'],
                                    type: 'create-games',
                                    likes: GameListManagerService
                                        .instance.games[index].likes,
                                    sendSelection: () {},
                                    isTimed: false,
                                    nbDifferences: GameListManagerService
                                        .instance.games[index].nbDifferences,
                                  );
                                },
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ]),
        ));
  }
}
