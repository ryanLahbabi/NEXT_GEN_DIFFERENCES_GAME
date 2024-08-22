import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_project/classes/communication-socket.dart';
import 'package:flutter_project/classes/gamePlay/observer-help.dart';
import 'package:flutter_project/common/socket-event-constants.dart';
import 'package:flutter_project/service/game-data-service.dart';

class ObserverService with ChangeNotifier {
  static final ObserverService _instance =
      ObserverService._privateConstructor();
  ObserverService._privateConstructor();

  factory ObserverService() {
    return _instance;
  }

  final CommunicationSocket communicationSocket = CommunicationSocket.instance;

  final interactionDuration = 3;
  final interactionDelay = 3;
  final interactionTextSize = 20;

  InteractionState _state = InteractionState.Initial;
  InteractionState get state => _state;
  String targetPlayerName = 'all';

  final Coordinates _canvasSize = Coordinates(640, 480);

  static ObserverService get instance => _instance;

  late StreamController<ObserverHelpResponseDTO> _interactionController;
  Stream<ObserverHelpResponseDTO> get interactionStream =>
      _interactionController.stream;

  Future<void> init() async {
    _interactionController =
        StreamController<ObserverHelpResponseDTO>.broadcast();
    CommunicationSocket.on(FromServer.OBSERVER_HELP, (data) {
      _receiveInteraction(ObserverHelpResponseDTO.fromJson(data));
    });
  }

  void changeState(InteractionState state) {
    _state = state;
    notifyListeners();
  }

  void startInteraction() {
    changeState(InteractionState.Started);
  }

  void sendInteraction(Coordinates firstCorner, Coordinates secondCorner) {
    final zoneCoordinates = computeZoneCoordinates(firstCorner, secondCorner);
    communicationSocket.send(
        ToServer.OBSERVER_HELP,
        ObserverHelpDTO(
            GameDataService().gameID, zoneCoordinates, targetPlayerName));
    changeState(InteractionState.Waiting);
    Timer(Duration(seconds: interactionDelay),
        () => changeState(InteractionState.Initial));
  }

  ObserverHelpCoordinates computeZoneCoordinates(
      Coordinates firstCorner, Coordinates secondCorner) {
    Coordinates restrictedSecondCorner = Coordinates(
      min(secondCorner.x, _canvasSize.x),
      min(secondCorner.y, _canvasSize.y),
    );
    restrictedSecondCorner = Coordinates(
        max(restrictedSecondCorner.x, 0), max(restrictedSecondCorner.y, 0));
    Coordinates upperLeft = Coordinates(
      min(firstCorner.x, restrictedSecondCorner.x),
      max(firstCorner.y, restrictedSecondCorner.y),
    );
    Coordinates lowerRight = Coordinates(
      max(firstCorner.x, restrictedSecondCorner.x),
      min(firstCorner.y, restrictedSecondCorner.y),
    );
    return ObserverHelpCoordinates(upperLeft, lowerRight);
  }

  void _receiveInteraction(ObserverHelpResponseDTO interaction) {
    _interactionController.add(interaction);
  }
}

enum InteractionState {
  Initial,
  Started,
  Waiting,
}
