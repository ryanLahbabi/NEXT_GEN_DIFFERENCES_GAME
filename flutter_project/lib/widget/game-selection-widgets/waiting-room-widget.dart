import 'package:flutter/material.dart';
import 'package:flutter_project/classes/communication-socket.dart';
import 'package:flutter_project/classes/gamePlay/player-info.dart';
import 'package:flutter_project/pages/game-screen.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:flutter_project/service/game-data-service.dart';
import 'package:flutter_project/service/game-list-manager-service.dart';
import 'package:flutter_project/service/game-service.dart';
import 'package:flutter_project/service/message-service.dart';
import 'package:flutter_project/widget/game-selection-widgets/waiting-games-widget.dart';
import 'package:flutter_project/widget/message-widget.dart';

import '../../classes/applocalization.dart';
import '../../common/socket-event-constants.dart';
import '../../dtos/channel-dto.dart';
import '../../service/settings-service.dart';

// ignore: must_be_immutable
class WaitingScreen extends StatefulWidget {
  String? cardId, gameId;
  dynamic info;

  WaitingScreen(this.cardId, this.gameId, this.info);

  @override
  _WaitingScreenState createState() => _WaitingScreenState();
}

class _WaitingScreenState extends State<WaitingScreen> {
  final TextEditingController _timeController =
      TextEditingController(text: '30');
  List<String> playerNames = [AuthService.instance.username];
  bool cheatModeActivated = false;
  bool friendsOnly = false;
  bool friendsOfFriends = false;
  bool isCreator = true;
  String gameId = "bye";
  int? responseType = 0;

  @override
  void initState() {
    super.initState();
    GameService.instance.init();
    GameService.instance.getReplayService().resetEveryValueInTheGame();

    GameDataService().isGameStarted = false;

    MessageService.instance.addGamingChannel(widget.info["gameId"]);

    setState(() {
      print(widget.info["gameId"]);
      if (widget.info["members"] != null) {
        List<dynamic> membersList = widget.info["members"];
        playerNames =
            List<String>.from(widget.info["members"].map((e) => e["name"]));

        List<PlayerInfo> updatedPlayersInfo = membersList.map((member) {
          return PlayerInfo(username: member["name"].toString());
        }).toList();

        GameDataService().playersInfo = updatedPlayersInfo;

        isCreator = AuthService.instance.username == playerNames[0];
      }

      widget.gameId = widget.info["gameId"];
      gameId = widget.info["gameId"];

      responseType = widget.info["responseType"];
      //GameService.instance.limitedTimeSingleplayer(info);
    });

    GameService.instance.navigateToGameScreenStream.listen((navigate) {
      if (navigate) {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (context) => GameScreen()),
        );
      }
    });

    CommunicationSocket.on("player_status", (info) {
      setState(() {
        switch (info["playerConnectionStatus"]) {
          case 1:
            playerNames = List<String>.from(playerNames
                .where((element) => element != info["user"]["name"]));
            break;
          case 2:
            playerNames.add(info["user"]["name"]);
            //GameDataService().playerNames.add(info["user"]["name"]);
            GameDataService().playersInfo.add(
                  PlayerInfo(username: info["user"]["name"]),
                );

            break;
          default:
        }
        isCreator = AuthService.instance.username == playerNames[0];
      });
    });
    _timeController.addListener(() {
      int value = int.tryParse(_timeController.text) ?? 5;
      if (value < 5) {
        _timeController.text = '5';
      } else if (value > 120) {
        _timeController.text = '120';
      }
    });
  }

  @override
  void dispose() {
    _timeController.dispose();
    CommunicationSocket.removeListener("response_to_play_request");
    CommunicationSocket.removeListener("player_status");
    super.dispose();
  }

  void toggleIsCreator() {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: Colors.purple[100],
      resizeToAvoidBottomInset: false,
      drawer: const MessageWidget(),
      body: Stack(
        children: [
          Positioned(
            top: 10,
            left: 10,
            width: 30,
            height: 30,
            child: Image.asset('assets/green_pin.png'),
          ),
          Positioned(
            top: 10,
            right: 10,
            width: 30,
            height: 30,
            child: Image.asset('assets/green_pin.png'),
          ),
          Positioned(
            bottom: 10,
            left: 10,
            width: 30,
            height: 30,
            child: Image.asset('assets/green_pin.png'),
          ),
          Positioned(
            bottom: 10,
            right: 10,
            width: 30,
            height: 30,
            child: Image.asset('assets/green_pin.png'),
          ),
          Positioned(
            top: 35,
            right: 70,
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
                        color: SettingsService.instance.theme == Themes.dark
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
          Center(
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    appLocalizations.translate('WAITING_FOR_PLAYERS') ?? '',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.purple[900],
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 40),
                  _buildPlayerContainer(),
                  if (isCreator) const SizedBox(height: 20),
                  if (isCreator) _buildSettingsContainer(),
                  const SizedBox(height: 20),
                  _buildActionButtons(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlayerContainer() {
    int playerSlots = 4;
    return Container(
      width: 1000,
      padding: const EdgeInsets.all(0),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.5),
        border: Border.all(color: Colors.purple[300]!, width: 3),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: List.generate(
          playerSlots,
          (index) => _buildPlayerName(
              index < playerNames.length ? playerNames[index] : '', index),
        ),
      ),
    );
  }

  Widget _buildPlayerName(String name, int index) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(5),
      child: Container(
        width: 1000,
        padding: const EdgeInsets.symmetric(vertical: 8.0),
        color: index % 2 == 0 ? Colors.purple[50] : Colors.purple[100],
        child: Text(
          name,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: Colors.purple[900],
            fontSize: 20,
          ),
        ),
      ),
    );
  }

  Widget _buildSettingsContainer() {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;
    return Container(
      width: 1000,
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.5),
        border: Border.all(color: Colors.purple[300]!, width: 3),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            appLocalizations.translate('GAME_SETTINGS') ?? '',
            style: TextStyle(
              color: Colors.purple[900],
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(width: 0),
              Text(
                appLocalizations.translate('FRIENDS_ONLY') ?? '',
                style: TextStyle(
                  color: Colors.purple[900],
                  fontSize: 16,
                ),
              ),
              Checkbox(
                value: friendsOnly,
                onChanged: (bool? value) {
                  setState(() {
                    friendsOnly = value!;
                    if (friendsOnly) {
                      friendsOfFriends = !friendsOnly;
                      GameListManagerService.instance.communicationSocket
                          .send(ToServer.UPDATE_ACCESS_TYPE, {
                        "gameId": gameId,
                        "type": 1,
                      });
                      print("sending access type");
                    } else if (friendsOfFriends && !friendsOnly) {
                      GameListManagerService.instance.communicationSocket
                          .send(ToServer.UPDATE_ACCESS_TYPE, {
                        "gameId": gameId,
                        "type": 2,
                      });
                    } else {
                      GameListManagerService.instance.communicationSocket
                          .send(ToServer.UPDATE_ACCESS_TYPE, {
                        "gameId": gameId,
                        "type": 0,
                      });
                    }
                  });
                },
              ),
              const SizedBox(width: 549),
              Text(
                appLocalizations.translate('FRIENDS_OF_FRIENDS') ?? '',
                style: TextStyle(
                  color: Colors.purple[900],
                  fontSize: 16,
                ),
              ),
              Checkbox(
                  value: friendsOfFriends,
                  onChanged: (bool? value) {
                    setState(() {
                      friendsOfFriends = value!;
                      if (friendsOfFriends) {
                        friendsOnly = !friendsOfFriends;
                        GameListManagerService.instance.communicationSocket
                            .send(ToServer.UPDATE_ACCESS_TYPE, {
                          "gameId": gameId,
                          "type": 2,
                        });
                      } else if (!friendsOfFriends && friendsOnly) {
                        GameListManagerService.instance.communicationSocket
                            .send(ToServer.UPDATE_ACCESS_TYPE, {
                          "gameId": gameId,
                          "type": 1,
                        });
                      } else {
                        GameListManagerService.instance.communicationSocket
                            .send(ToServer.UPDATE_ACCESS_TYPE, {
                          "gameId": gameId,
                          "type": 0,
                        });
                      }
                    });
                  }),
            ],
          ),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildCustomTextField(
                        appLocalizations.translate('GAME_TIME') ?? '',
                        _timeController),
                  ],
                ),
              ),
              Expanded(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(width: 200),
                    Text(
                      appLocalizations.translate('CHEAT_ACCESS') ?? '',
                      style: TextStyle(
                        color: Colors.purple[900],
                        fontSize: 16,
                      ),
                    ),
                    Checkbox(
                      value: cheatModeActivated,
                      onChanged: (bool? value) {
                        setState(() {
                          cheatModeActivated = value!;
                          GameDataService().isCheatAllowed = cheatModeActivated;
                        });
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCustomTextField(
      String labelText, TextEditingController controller) {
    return Row(
      children: [
        Expanded(
          child: Text(
            labelText,
            style: TextStyle(
              color: Colors.purple[900],
              fontSize: 16,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Container(
          width: 100,
          height: 48,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(
              color: Colors.purple[300]!,
              width: 2,
            ),
            borderRadius: BorderRadius.circular(8),
          ),
          child: TextFormField(
            controller: controller,
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
            ),
            decoration: InputDecoration(
              contentPadding: const EdgeInsets.symmetric(vertical: -10),
              border: InputBorder.none,
              hintStyle: TextStyle(
                color: Colors.purple[300],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildActionButtons() {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18.0),
          child: Ink.image(
            image: const AssetImage('assets/paper_button.png'),
            fit: BoxFit.cover,
            height: 50,
            width: 480,
            child: InkWell(
              onTap: () {
                CommunicationSocket().send("leave_game", gameId);
                MessageService.instance.removeGamingChannel();
                Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => const WaitingGameWidget()));
                print(GameDataService().playersInfo);

                GameDataService().playersInfo.removeWhere((player) =>
                    player.username == AuthService.instance.username);
              },
              child: Container(
                width: 500,
                height: 50,
                alignment: Alignment.center,
                child: Text(
                  appLocalizations.translate('QUIT') ?? '',
                  style: TextStyle(
                    color: Colors.purple[900],
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
        ),
        if (isCreator)
          if (playerNames.length < 2)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20.0),
                  child: InkWell(
                    onTap: null,
                    child: Container(
                      width: 500,
                      height: 50,
                      alignment: Alignment.center,
                      color: const Color.fromARGB(255, 205, 205, 205),
                      child: Text(
                        appLocalizations.translate('WAITING_FOR_PLAYERS') ?? '',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Color.fromARGB(255, 74, 68, 81),
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                const CircularProgressIndicator(),
              ],
            )
          else
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18.0),
              child: Ink.image(
                image: const AssetImage('assets/paper_button.png'),
                fit: BoxFit.cover,
                height: 50,
                width: 480,
                child: InkWell(
                  onTap: () {
                    final totalTime = _timeController.text;

                    CommunicationSocket().send("start_game", {
                      "gameId": widget.gameId,
                      "totalTime": totalTime,
                      "canCheat": cheatModeActivated,
                    });
                  },
                  child: Container(
                    width: 500,
                    height: 50,
                    alignment: Alignment.center,
                    child: Text(
                      appLocalizations.translate('START_THE_GAME') ?? '',
                      style: TextStyle(
                        color: Colors.purple[900],
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
            ),
        if (!isCreator)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: InkWell(
              onTap: null,
              child: Container(
                width: 500,
                height: 50,
                alignment: Alignment.center,
                color: const Color.fromARGB(255, 205, 205, 205),
                child: Text(
                  appLocalizations.translate('WAIT_START_BY_CREATOR') ?? '',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Color.fromARGB(255, 74, 68, 81),
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
