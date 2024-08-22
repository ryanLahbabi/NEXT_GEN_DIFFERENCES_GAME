import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_project/classes/communication-socket.dart';
import 'package:flutter_project/common/socket-event-constants.dart';
import 'package:flutter_project/environnment.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:flutter_project/service/friends-service.dart';
import 'package:flutter_project/service/user-service.dart';
import 'package:flutter_project/widget/game-selection-widgets/waiting-room-limited.dart';
import 'package:flutter_project/widget/game-selection-widgets/waiting-room-widget.dart';
import 'package:flutter_project/widget/tools-widgets/paper-button-widget.dart';
import 'package:http/http.dart' as http;

import '../../classes/applocalization.dart';
import '../../dtos/cards-dto.dart';

enum Difficulty {
  EASY,
  HARD,
  MEDIUM,
}

class GameCardWidget extends StatefulWidget {
  final String? cardID;
  final String? gameID;
  final int? gameMode;
  final int? observerNbr;
  final String name;
  final String image;
  final String difficulty;
  final List<String>? awaitingPlayers;
  final String type;
  final Function sendSelection;
  final bool isTimed;
  final int? nbDifferences;
  final GameAccessType? gameAccessType;
  int? likes;

  GameCardWidget({
    Key? key,
    this.gameID,
    this.cardID,
    this.gameMode,
    required this.name,
    required this.image,
    required this.difficulty,
    this.awaitingPlayers,
    required this.type,
    required this.sendSelection,
    required this.isTimed,
    this.nbDifferences,
    this.gameAccessType,
    this.observerNbr,
    this.likes,
  }) : super(key: key);

  @override
  _GameCardWidget createState() => _GameCardWidget();
}

class _GameCardWidget extends State<GameCardWidget> {
  String textDifficulty = '';
  bool isLiked = false;
  bool isDisliked = false;

  @override
  void initState() {
    super.initState();
    fetchLikes();
  }

  fetchLikes() async {
    if (widget.cardID != null) {
      final userData = await UserDataService.instance.fetchUserData();
      setState(() {
        isLiked =
            List<String>.from(userData['likedCards']).contains(widget.cardID!);
        isDisliked = List<String>.from(userData['dislikedCards'])
            .contains(widget.cardID!);
      });
    }
  }

  like() async {
    int op;
    if (isLiked) {
      setState(() {
        widget.likes = widget.likes! - 1;
        isLiked = false;
      });
      op = 2;
    } else {
      setState(() {
        widget.likes = isDisliked ? widget.likes! + 2 : widget.likes! + 1;
        isLiked = true;
        isDisliked = false;
      });
      op = 0;
    }
    final token = await AuthService.instance.getToken();
    http.post(
      Uri.parse('${Environnment.httpLink}/card/like'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(
        {'cardId': widget.cardID, 'likeOp': op},
      ),
    );
  }

  dislike() async {
    int op;
    if (isDisliked) {
      setState(() {
        widget.likes = widget.likes! + 1;
        isDisliked = false;
      });
      op = 2;
    } else {
      setState(() {
        widget.likes = isLiked ? widget.likes! - 2 : widget.likes! - 1;
        isDisliked = true;
        isLiked = false;
      });
      op = 1;
    }
    final token = await AuthService.instance.getToken();
    http.post(
      Uri.parse('${Environnment.httpLink}/card/like'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode(
        {'cardId': widget.cardID, 'likeOp': op},
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    bool showPlayerList = false;
    if (widget.type == 'waiting-games' ||
        widget.type == 'time-limited-game' ||
        widget.type == 'observer') {
      showPlayerList = true;
    }
    int observerNbr = 0;
    observerNbr = widget.observerNbr ?? observerNbr;

    Color backgroundColor;
    if (widget.isTimed) {
      backgroundColor = const Color(0xFFfdc97b);
    } else {
      switch (widget.difficulty) {
        case '0':
          backgroundColor = const Color(0xFF67eae5);
          textDifficulty = appLocalizations.translate('EASY') ?? '';

          break;
        case '1':
          backgroundColor = const Color(0xFFff7faf);
          textDifficulty = appLocalizations.translate('HARD') ?? '';
          break;
        default:
          backgroundColor = const Color(0xFFfcdb00);
          textDifficulty = appLocalizations.translate('MEDIUM') ?? '';
          break;
      }
    }

    Widget button;
    if (widget.type == 'observer') {
      button = PaperButtonWidget(
        text: appLocalizations.translate('OBSERVE_GAME') ?? '',
        width: 180,
        height: 50,
        widthPin: 15,
        onTap: () {
          CommunicationSocket().send(ToServer.JOIN_OBSERVER, widget.gameID);
        },
      );
    } else if (widget.isTimed) {
      button = PaperButtonWidget(
        text: appLocalizations.translate('JOIN_GAME') ?? '',
        width: 180,
        height: 50,
        widthPin: 15,
        onTap: () {
          CommunicationSocket.on("response_to_play_request", (info) {
            Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => WaitingScreenLimitedTime(
                      widget.cardID.toString(),
                      widget.gameID.toString(),
                      info)),
            );
          });
          CommunicationSocket().send(ToServer.REQUEST_TO_PLAY, {
            'gameId': widget.gameID,
            'gameMode': widget.gameMode,
            'playerName': AuthService.instance.username,
          });
        },
      );
    } else {
      if (widget.type == 'waiting-games') {
        button = PaperButtonWidget(
          text: appLocalizations.translate('JOIN_GAME') ?? '',
          width: 180,
          height: 50,
          widthPin: 15,
          onTap: () {
            CommunicationSocket.on("response_to_play_request", (info) {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => WaitingScreen(
                        widget.cardID.toString(),
                        widget.gameID.toString(),
                        info)),
              );
            });
            CommunicationSocket().send(ToServer.REQUEST_TO_PLAY, {
              'gameId': widget.gameID,
              'gameMode': widget.gameMode,
              'playerName': AuthService.instance.username,
            });
          },
        );
      } else if (widget.type == 'admin') {
        button = PaperButtonWidget(
          text: 'Supprimer le jeu',
          width: 180,
          height: 50,
          widthPin: 15,
          onTap: () {},
        );
      } else {
        button = PaperButtonWidget(
          text: appLocalizations.translate('CREATE_GAME') ?? '',
          width: 180,
          height: 50,
          widthPin: 15,
          onTap: () async {
            CommunicationSocket.on("response_to_play_request", (info) {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => WaitingScreen(
                        widget.cardID.toString(),
                        widget.gameID.toString(),
                        info)),
              );
            });
            List<String> playersWithAccess;
            try {
              playersWithAccess = FriendsService.instance
                  .getFriends(AuthService.instance.username);
            } catch (e) {
              playersWithAccess = [];
            }
            CommunicationSocket().send(ToServer.REQUEST_TO_PLAY, {
              'cardId': widget.cardID,
              'gameId': widget.gameID,
              'gameMode': widget.gameMode,
              'playerName': AuthService.instance.username,
              'playersWithAccess': playersWithAccess,
            });
          },
        );
      }
    }

    Widget playerList = showPlayerList
        ? SingleChildScrollView(
            child: ClipRect(
              clipBehavior: Clip.none,
              child: Container(
                height: 200,
                child: PlayerList(
                  playerNames: widget.awaitingPlayers!,
                  isTimed: widget.isTimed,
                  type: widget.type,
                ),
              ),
            ),
          )
        : const SizedBox.shrink();
    return Container(
      decoration: BoxDecoration(
        color: backgroundColor,
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            offset: Offset(0, 5),
          ),
        ],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          if (widget.isTimed && observerNbr > 0)
            Positioned(
                top: 10,
                left: 10,
                child: Container(
                    decoration: const BoxDecoration(
                      color: Colors.yellow,
                      borderRadius: BorderRadius.all(Radius.circular(10)),
                    ),
                    padding: const EdgeInsets.all(1.0),
                    child: const Text('observé'))),
          Positioned(
              top: 145,
              right: 10,
              child: widget.type == 'create-games' || widget.type == 'admin'
                  ? Align(
                      alignment: Alignment.bottomRight,
                      child: button,
                    )
                  : const SizedBox.shrink()),
          widget.isTimed
              ? Positioned(
                  top: 0,
                  right: 50,
                  child: playerList,
                )
              : Positioned(
                  top: 50,
                  right: -100,
                  child: playerList,
                ),
          Padding(
            padding: const EdgeInsets.all(15.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 0),
                if (!widget.isTimed) ...[
                  Row(
                    children: [
                      Text(
                        widget.name,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 10),
                      if (observerNbr > 0)
                        Container(
                            decoration: const BoxDecoration(
                              color: Colors.yellow,
                              borderRadius:
                                  BorderRadius.all(Radius.circular(10)),
                            ),
                            padding: const EdgeInsets.all(5.0),
                            child: const Text('observé')),
                    ],
                  ),
                  Expanded(
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Image.memory(
                        base64Decode(widget.image),
                        fit: BoxFit.cover,
                        width: widget.type == 'create-games' ||
                                widget.type == 'admin'
                            ? 210
                            : 250,
                        height: widget.type == 'create-games' ||
                                widget.type == 'admin'
                            ? 1300
                            : 200,
                      ),
                    ),
                  ),
                ],
                widget.isTimed
                    ? Align(
                        alignment: Alignment.center,
                        child: button,
                      )
                    : widget.type == 'create-games' || widget.type == 'admin'
                        ? const SizedBox.shrink()
                        : Align(
                            alignment: Alignment.bottomLeft,
                            child: button,
                          ),
              ],
            ),
          ),
          widget.isTimed
              ? const SizedBox.shrink()
              : Positioned(
                  top: 10,
                  right: 10,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        (appLocalizations.translate('DIFFICULTY') ?? '') +
                            ': ' +
                            textDifficulty,
                        style: const TextStyle(fontSize: 16),
                      ),
                      Text(
                        (appLocalizations.translate('DIFFERENCES') ?? '') +
                            ': ${widget.nbDifferences}',
                        style: const TextStyle(fontSize: 16),
                      ),
                    ],
                  ),
                ),
          if (widget.type == 'create-games')
            Positioned(
              top: 75,
              right: 10,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    'Likes:',
                    style: const TextStyle(fontSize: 16),
                  ),
                  const SizedBox(width: 10),
                  Text(widget.likes == null ? '0' : widget.likes.toString()),
                  const SizedBox(width: 30),
                  TextButton(
                    child: Icon(
                      Icons.thumb_up,
                      color: isLiked ? Colors.green : Colors.black38,
                      size: 25.0,
                    ),
                    onPressed: () {
                      like();
                    },
                  ),
                  const SizedBox(width: 10),
                  TextButton(
                    child: Icon(
                      Icons.thumb_down,
                      color: isDisliked ? Colors.red : Colors.black38,
                      size: 25.0,
                    ),
                    onPressed: () {
                      dislike();
                    },
                  ),
                ],
              ),
            ),
          widget.isTimed
              ? Positioned(
                  left: 180,
                  top: 10,
                  child: Container(
                    width: 25,
                    height: 25,
                    decoration: const BoxDecoration(
                      image: DecorationImage(
                        image: AssetImage('assets/push_pin.png'),
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                )
              : Positioned(
                  left: 220,
                  top: 10,
                  child: Container(
                    width: 25,
                    height: 25,
                    decoration: const BoxDecoration(
                      image: DecorationImage(
                        image: AssetImage('assets/push_pin.png'),
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),
                ),
        ],
      ),
    );
  }
}

class PlayerList extends StatelessWidget {
  final List<String> playerNames;
  final bool isTimed;
  final String type;

  const PlayerList({
    Key? key,
    required this.playerNames,
    required this.isTimed,
    required this.type,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    String titleText = type == 'observer'
        ? appLocalizations.translate('PLAYERS_IN_GAME') ?? ''
        : appLocalizations.translate('AWAITING_PLAYERS') ?? '';

    BoxDecoration decoration = isTimed
        ? const BoxDecoration(color: Colors.transparent)
        : const BoxDecoration(
            image: DecorationImage(
              image: AssetImage('assets/Score.png'),
              fit: BoxFit.fill,
            ),
          );

    return Container(
      width: 280,
      decoration: decoration,
      child: Padding(
        padding: const EdgeInsets.all(40.0),
        child: Column(
          crossAxisAlignment:
              isTimed ? CrossAxisAlignment.center : CrossAxisAlignment.start,
          children: [
            Text(
              titleText,
              style: TextStyle(
                fontSize: type == 'observer' ? 18 : 20,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
              textAlign: isTimed ? TextAlign.center : TextAlign.start,
            ),
            const SizedBox(height: 10),
            ...playerNames
                .map((name) => Text(
                      name,
                      style: const TextStyle(color: Colors.black),
                      textAlign: isTimed ? TextAlign.center : TextAlign.start,
                    ))
                .toList(),
          ],
        ),
      ),
    );
  }
}
