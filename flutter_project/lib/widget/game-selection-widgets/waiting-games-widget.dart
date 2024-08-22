import 'package:flutter/material.dart';
import 'package:flutter_project/common/enum.dart';
import 'package:flutter_project/service/friends-service.dart';
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
import '../../service/authentication-service.dart';
import '../../service/settings-service.dart';
import '../../service/user-service.dart';

class WaitingGameWidget extends StatefulWidget {
  const WaitingGameWidget({super.key});

  @override
  _WaitingGameWidget createState() => _WaitingGameWidget();
}

class _WaitingGameWidget extends State<WaitingGameWidget> {
  final ScrollController _scrollController = ScrollController();
  List<String> hasBlocked = [];
  List<String> blockedRelations = [];

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    getUserData();
//    GameListManagerService.instance.init();
    GameListManagerService.cardStream.listen((event) {
      if (mounted) {
        setState(() {});
      }
    });
  }

  Future<void> getUserData() async {
    try {
      final userData = await UserDataService.instance.fetchUserData();
      setState(() {
        hasBlocked = List<String>.from(userData['hasBlocked']);
        blockedRelations = List<String>.from(userData['blockRelations']);
        print('Blocked relations: $blockedRelations');
        print('Has blocked: $hasBlocked');
      });
    } catch (e) {
      print('Error fetching user data: $e');
    }
  }

  currentUserHasAccess(Game game) {

    if (game.awaitingPlayers == null) return false;
    bool isBlocked = game.awaitingPlayers!.any((playerUsername) =>
        !hasBlocked.contains(playerUsername) &&
        blockedRelations.contains(playerUsername));

    if (isBlocked) return false;

    switch (game.accessType) {
      case GameAccessType.Everyone:
        return true;
      case GameAccessType.Friends:
        return game.playersWithAccess?.contains(AuthService.instance.username);
      case GameAccessType.FriendsOfFriends:
        if (game.playersWithAccess!.contains(AuthService.instance.username)) {
          return true;
        }
        final friends =
            FriendsService.instance.getFriends(AuthService.instance.username);
        return friends
            .any((friend) => game.playersWithAccess!.contains(friend));
      default:
        return true;
    }
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
            Stack(
              alignment: Alignment.center,
              children: [
                FrameWidget(
                  type: 'waiting-games',
                  child: Column(
                    children: [
                      Expanded(
                        flex: 1,
                        child: ScrollbarTheme(
                          data: ScrollbarThemeData(
                            thumbColor: MaterialStateProperty.all(
                                Color.fromARGB(255, 218, 128, 226)),
                            thickness: MaterialStateProperty.all(15.0),
                            radius: const Radius.circular(5),
                            crossAxisMargin: 2.5,
                            mainAxisMargin: 5.0,
                          ),
                          child: Scrollbar(
                            controller: _scrollController,
                            thumbVisibility: true,
                            child: GridView.count(
                              controller: _scrollController,
                              padding: const EdgeInsets.only(right: 100),
                              crossAxisCount: 2,
                              childAspectRatio: 2.1,
                              crossAxisSpacing: 110,
                              mainAxisSpacing: 12,
                              children: GameListManagerService
                                  .instance.joinableGames
                                  .where((game) =>
                                      game.gameMode ==
                                          GameMode.ClassicDeathMatch &&
                                      currentUserHasAccess(game))
                                  .map((e) => GameCardWidget(
                                        gameMode: 4,
                                        cardID: e.cardId,
                                        gameID: e.gameID,
                                        name: e.name.toString(),
                                        image: e.originalImage.toString(),
                                        difficulty: e.difficulty.toString(),
                                        awaitingPlayers: e.awaitingPlayers,
                                        type: 'waiting-games',
                                        sendSelection: () {},
                                        isTimed: false,
                                        nbDifferences: e.nbDifferences?.toInt(),
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
