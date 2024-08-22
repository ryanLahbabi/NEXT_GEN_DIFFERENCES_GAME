import 'package:flutter_project/common/enum.dart';
import 'package:flutter_project/service/game-data-service.dart';

class GameInfo {
  String? gameId;
  GameMode gameMode;
  String? cardId;
  List<String> waitingPlayers;

  GameInfo({
    this.gameId,
    required this.gameMode,
    this.cardId,
    required this.waitingPlayers,
  });
}
