import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_project/classes/communication-socket.dart';
import 'package:flutter_project/classes/gamePlay/differences-images.dart';
import 'package:flutter_project/common/enum.dart';
import 'package:flutter_project/common/socket-event-constants.dart';
import 'package:flutter_project/dtos/game-end-dto.dart';
import 'package:flutter_project/dtos/replay-dto.dart';
import 'package:flutter_project/pages/main-page.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:flutter_project/service/delay-service.dart';
import 'package:flutter_project/service/game-data-service.dart';
import 'package:flutter_project/service/game-service.dart';
import 'package:flutter_project/service/message-service.dart';
import 'package:flutter_project/service/replay-service.dart';
import 'package:flutter_project/service/sound-service.dart';
import 'package:flutter_project/widget/game-play/Observer/soundboard-widget.dart';
import 'package:flutter_project/widget/game-play/cheat-toggle.dart';
import 'package:flutter_project/widget/game-play/error-widget.dart';
import 'package:flutter_project/widget/game-play/flicker.dart';
import 'package:flutter_project/widget/game-play/game-info.dart';
import 'package:flutter_project/widget/game-play/images-difference.dart';
import 'package:flutter_project/widget/game-play/replay-widget.dart';
import 'package:flutter_project/widget/message-widget.dart';

import '../classes/applocalization.dart';
import '../dtos/channel-dto.dart';
import '../service/settings-service.dart';

class GameScreen extends StatefulWidget {
  @override
  _GameScreenState createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  List<ErrorMarkerData> errorMarkersData = [];
  bool showFlicker = false;
  String? flickerBase64Image;

  int currentTime = 0;
  String? cheatBase64Image;
  String originalImage = "";
  String modifiedImage = "";
  List<String> cheatData = [];
  bool showCheat = false;
  final SoundService _soundService = SoundService();
  final DelayService _delayService = DelayService();
  final GameDataService _gameDataService = GameDataService();
  final GameService _gameService = GameService();
  ReplayService? _replayService;

  ReplayService getReplayService() {
    _replayService ??= ReplayService()
      ..initialize(
          _delayService, _gameService, _soundService, _gameDataService);
    return _replayService!;
  }

  @override
  void initState() {
    _replayService = ReplayService();
    initializeReplayListener();
    super.initState();

    if (GameService.instance.originalImageLimited.isNotEmpty) {
      originalImage = GameService.instance.originalImageLimited[0];
    }
    if (GameService.instance.modifiedImageLimited.isNotEmpty) {
      modifiedImage = GameService.instance.modifiedImageLimited[0];
    }

    GameDataService().showCheat = false;

    GameService.instance.nextCardOgStream.listen(
      (List<String> event) {
        setState(() {
          originalImage = event.isNotEmpty ? event[0] : "";
        });
      },
    );

    GameService.instance.nextCardNewStream.listen(
      (List<String> event) {
        setState(() {
          modifiedImage = event.isNotEmpty ? event[0] : "";
        });
      },
    );

    GameService.instance.onErrorClick = (x, y) {
      if (mounted) {
        setState(() {
          errorMarkersData.add(ErrorMarkerData(posX: x, posY: y));
        });
      }

      Future.delayed(const Duration(seconds: 1), () {
        if (mounted) {
          setState(() {
            final marker = errorMarkersData.last;
            marker.isVisible = false;
          });
        }
      });
    };

    /*GameService.instance.flickerEventStream.listen((base64Image) {
      showFlickerOverlay(base64Image);
    });*/

    GameService.instance.gameEndStream.listen((gameEndData) {
      _showGameEndDialog(gameEndData);
    });
  }

  void initializeReplayListener() {
    print("INITREPLAYLISTENER");
    getReplayService().replayActionTriggered.listen((action) {
      //print("action.category: ${action.category}");
      //print("action.input: ${action.input}");
      switch (action.category) {
        // case 'startOriginalPicture':
        //   originalImage = (action.input as ReplayInput<String>).value;
        //   GameService.instance.originalImageLimited.add(originalImage);

        //   break;
        // case 'startModifiedPicture':
        //   modifiedImage = (action.input as ReplayInput<String>).value;
        //   GameService.instance.modifiedImageLimited.add(modifiedImage);
        //   break;
        case 'showSuccess':
          DifferenceImages images;

          // ReplayInput<DifferenceImages> actionInputAsDifferenceImages =
          //     ReplayInput(value: images);

          print("vvvvvvvvvvvvvvvvvvvvv");
          print(action.input);
          print(action.input.value);
          // DifferenceImages actionInputAsDifferenceImages =
          //     (action.input.value as ReplayInput<DifferenceImages>).value;
          print("SENDING DIFFERENCE OVERLAY");

          if (action.input.value is DifferenceImages) {
            images = action.input.value;
          } else {
            images = DifferenceImages(
                differenceNaturalOverlay:
                    action.input.value["differenceNaturalOverlay"].toString(),
                differenceFlashOverlay:
                    action.input.value["differenceFlashOverlay"].toString(),
                index: action.input.value["index"]);
          }

          _gameService.showSuccess(images);

          // GameService.instance.flickerEventController
          //     .add(images.differenceFlashOverlay.toString());

          // getReplayService().setDifferenceOverlay(images);
          /*showFlickerOverlay(actionInputAsDifferenceImages
                .differenceFlashOverlay
                .toString());*/

          break;
        case 'cheatingValue':
          if (action.input is ReplayInput<bool>) {
            bool cheatValue = (action.input as ReplayInput<bool>).value;
            GameDataService().showCheat = cheatValue;
          }
          break;
        default:
          break;
      }
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (GameService.instance.hasGameEnded) {
      if (mounted) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _showGameEndDialog(GameService.instance.lastGameEndData!);
          GameService.instance.hasGameEnded = false;
        });
      }
    }
  }

  void _showGameEndDialog(GameEndData gameEndData) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        final currentUserResult = gameEndData.players.firstWhere(
          (player) => player.name == AuthService.instance.username,
          orElse: () => PlayerResult(
              name: AuthService.instance.username,
              winner: false,
              deserter: false),
        );
        final winnerResult =
            gameEndData.players.firstWhere((player) => player.winner);

        String message = currentUserResult.winner
            ? appLocalizations.translate('YOU_WON') ?? ''
            : "${GameDataService().isObserver ? "" : "${appLocalizations.translate('YOU_LOST') ?? ''}\n"}  ${appLocalizations.translate('THE_WINNER_IS')} ${winnerResult.name}.";

        if (GameDataService().gameMode == GameMode.LimitedTimeDeathMatch) {
          message =
              "${appLocalizations.translate('CONGRATS_DIFFERENCES_FOUND') ?? ''}\n${GameDataService().totalScore} ${appLocalizations.translate('DIFFERENCES_FOUND') ?? ''}";
        }

        return StatefulBuilder(builder: (context, setState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20.0)),
            backgroundColor: Colors.lightBlue.shade100,
            title: const Text("Game Over",
                style: TextStyle(fontWeight: FontWeight.bold)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Text(message,
                    style: const TextStyle(
                        fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 20),
              ],
            ),
            actions: <Widget>[
              if (!GameDataService().isObserver &&
                  GameMode.ClassicDeathMatch == GameDataService().gameMode)
                TextButton(
                  child: const Text("Lancer la reprise vidéo"),
                  onPressed: () {
                    // reset score
                    _gameService.gameData.playersInfo.forEach((player) {
                      player.score = 0;
                    });
                    //print("Lancer la reprise vidéo");
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(builder: (context) => GameScreen()),
                    );
                    GameService.instance.clearGameEndData();
                    getReplayService().isReplayMode = true;
                    getReplayService().restart();
                    MessageService.instance.removeGamingChannel();
                  },
                ),
              TextButton(
                child: const Text("Retourner au menu principal"),
                onPressed: () {
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (context) => const MainPage()),
                  );
                  GameService.instance.clearGameEndData();
                  GameService.instance.abandonGame();
                  GameService.instance.dispose();
                },
              ),
            ],
          );
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    var screenSize = MediaQuery.of(context).size;
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;
    double imageWidth = 640;
    double imageSpacing = screenSize.width * 0.01;
    double imageHeight = 480;

    return Scaffold(
        resizeToAvoidBottomInset: false,
        drawer: const MessageWidget(),
        body: Column(children: [
          if (getReplayService().isReplayMode)
            Align(
              child: SizedBox(
                width: screenSize.width,
                height: 100,
                child: VideoReplayControlWidget(),
              ),
            ),
          Expanded(
            child: Stack(
              children: [
                Container(
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
                ),
                Positioned(
                  top: GameService().getReplayService().isReplayMode ? 6 : 80,
                  left: (screenSize.width - imageWidth * 2 - imageSpacing) / 2,
                  child: GameInfoWidget(),
                ),
                Positioned(
                  top: GameService().getReplayService().isReplayMode ? -3 : 70,
                  right: 20,
                  child: BlueRectangleWidget(
                      timerStream: GameService.instance.timeUpdateStream),
                ),
                Positioned(
                    top: GameService().getReplayService().isReplayMode
                        ? 127
                        : 220,
                    left:
                        (screenSize.width - imageWidth * 2 - imageSpacing) / 2,
                    child: ImageWithHeader(
                      header: SettingsService.instance.language == Language.fr
                          ? "Image originale"
                          : "Original Image",
                      imageName:
                          GameService.instance.originalImageLimited.isNotEmpty
                              ? GameService.instance.originalImageLimited[0]
                              : "",
                      imageWidth: imageWidth,
                    )),
                Positioned(
                    top: GameService().getReplayService().isReplayMode
                        ? 127
                        : 220,
                    left: (screenSize.width + imageSpacing) / 2,
                    child: ImageWithHeader(
                      header: SettingsService.instance.language == Language.fr
                          ? "Image modifiée"
                          : "Modified Image",
                      imageName:
                          GameService.instance.modifiedImageLimited.isNotEmpty
                              ? GameService.instance.modifiedImageLimited[0]
                              : "",
                      imageWidth: imageWidth,
                    )),

                if (GameDataService().isCheatAllowed &&
                    !GameDataService().isObserver &&
                    !GameService.instance.getReplayService().isReplaying)
                  Positioned(
                      top: 35,
                      right: 100,
                      child: VisibilityToggleIcon(
                        onToggle: (bool isVisible) {
                          showCheat = isVisible;
                          GameDataService().showCheat = isVisible;

                          CommunicationSocket().send(
                              ToServer.CHEAT, GameService.instance.gameID);

                          ReplayInput<bool> cheatingValue =
                              ReplayInput<bool>(value: isVisible);

                          getReplayService()
                              .doAndStore('cheatingValue', cheatingValue);
                        },
                      )),
                //CHEAT
                StreamBuilder<List<String>>(
                  stream: GameService.instance.cheatDataStream,
                  builder: (context, snapshot) {
                    if (snapshot.hasData && GameDataService().showCheat) {
                      return Positioned(
                        top: GameService().getReplayService().isReplayMode
                            ? 172
                            : 265,
                        left:
                            (MediaQuery.of(context).size.width + imageSpacing) /
                                2,
                        child: Opacity(
                          opacity: 1.0,
                          child: FlickerSequenceOverlay(
                            base64Images: snapshot.data!,
                            width: imageWidth,
                            height: imageHeight,
                          ),
                        ),
                      );
                    } else {
                      return Container();
                    }
                  },
                ),
                //Clignotement cheat
                StreamBuilder<List<String>>(
                  stream: GameService.instance.cheatDataStream,
                  builder: (context, snapshot) {
                    if (snapshot.hasData && GameDataService().showCheat) {
                      return Positioned(
                        top: GameService().getReplayService().isReplayMode
                            ? 172
                            : 265,
                        left:
                            (screenSize.width - imageWidth * 2 - imageSpacing) /
                                2,
                        child: Opacity(
                          opacity: 1.0,
                          child: FlickerSequenceOverlay(
                            base64Images: snapshot.data!,
                            width: imageWidth,
                            height: imageHeight,
                          ),
                        ),
                      );
                    } else {
                      return Container();
                    }
                  },
                ),
                //FLICKER
                Positioned(
                  top:
                      GameService().getReplayService().isReplayMode ? 172 : 265,
                  left: (screenSize.width + imageSpacing) / 2,
                  child: FlickerWidget(width: imageWidth, height: imageHeight),
                ),
                Positioned(
                  top:
                      GameService().getReplayService().isReplayMode ? 172 : 265,
                  left: (screenSize.width - imageWidth * 2 - imageSpacing) / 2,
                  child: FlickerWidget(width: imageWidth, height: imageHeight),
                ),
                // image Difference
                Positioned(
                  top:
                      GameService().getReplayService().isReplayMode ? 172 : 265,
                  left: (screenSize.width + imageSpacing) / 2,
                  child: ImageDifference(
                    key: UniqueKey(),
                    overlayStream: GameService.instance.differenceOverlayStream,
                    width: imageWidth,
                    height: imageHeight,
                  ),
                ),
                Positioned(
                  top:
                      GameService().getReplayService().isReplayMode ? 172 : 265,
                  left: (screenSize.width - imageWidth * 2 - imageSpacing) / 2,
                  child: ImageDifference(
                    key: UniqueKey(),
                    overlayStream: GameService.instance.differenceOverlayStream,
                    width: imageWidth,
                    height: imageHeight,
                  ),
                ),

                StreamBuilder<ErrorMarkerData>(
                  stream: GameService.instance.errorMarkerController.stream,
                  builder: (context, snapshot) {
                    if (!snapshot.hasData) {
                      return const SizedBox.shrink();
                    }

                    final markerData = snapshot.data!;

                    return markerData.isVisible
                        ? ErrorMarker(
                            posX: markerData.posX, posY: markerData.posY)
                        : const SizedBox.shrink();
                  },
                ),
                if (GameDataService().isObserver)
                  const Positioned(
                    top: 35,
                    right: 80,
                    child: SoundBoardModal(),
                  ),
                //notifications messages
                if (!GameService.instance.getReplayService().isReplayMode)
                  Positioned(
                    top: 35,
                    right: 30,
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
                                color: SettingsService.instance.theme ==
                                        Themes.dark
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
                                                  color: Colors.white,
                                                  width: 1),
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
          )
        ]));
  }

  @override
  void dispose() {
    GameService.instance.onErrorClick = null;
    CommunicationSocket.removeListener(FromServer.PLAYER_STATUS);
    CommunicationSocket.removeListener(FromServer.ENDGAME);

    super.dispose();
  }
}

class FlickerWidget extends StatefulWidget {
  final double width;
  final double height;

  const FlickerWidget({
    Key? key,
    required this.width,
    required this.height,
  }) : super(key: key);

  @override
  _FlickerWidgetState createState() => _FlickerWidgetState();
}

class _FlickerWidgetState extends State<FlickerWidget> {
  bool _isVisible = false;
  String _base64Image = "";
  StreamSubscription<String>? _flickerStreamSubscription;

  void flickerImage(String base64Image) {
    print("-------------flickerImage");
    setState(() {
      _isVisible = true;
      _base64Image = base64Image;
    });
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        setState(() => _isVisible = false);
      }
    });
  }

  @override
  void initState() {
    super.initState();
    print("-------------flickerEventStream");

    _flickerStreamSubscription =
        GameService.instance.flickerEventStream.listen(flickerImage);
  }

  @override
  Widget build(BuildContext context) {
    return Visibility(
      visible: _isVisible,
      child: FlickerOverlay(
        base64Image: _base64Image,
        width: widget.width,
        height: widget.height,
      ),
    );
  }

  @override
  void dispose() {
    _flickerStreamSubscription?.cancel();

    super.dispose();
  }
}
