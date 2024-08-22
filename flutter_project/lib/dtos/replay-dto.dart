import 'package:flutter_project/classes/gamePlay/game-values.dart';
import 'package:flutter_project/common/enum.dart';

enum ReplayInputType {
  double,
  number,
  string,
  hint,
  gameClickOutputDto,
  endgameOutputDto,
  message,
  boolean,
  differenceImages,
  coordinates,
  stringArray,
  List,
  int,
}

abstract class JsonSerializable {
  Map<String, dynamic> toJson();
}

class ReplayInput<T> {
  final T value;

  ReplayInput({required this.value});

  Map<String, dynamic> toJson() {
    dynamic serializedValue;
    if (value is JsonSerializable) {
      serializedValue = (value as JsonSerializable).toJson();
    } else if (value is Map) {
      serializedValue = value;
    } else if (value is List && value != null) {
      serializedValue = (value as List).map((item) {
        if (item is JsonSerializable) {
          return item.toJson();
        }
        return item;
      }).toList();
    } else {
      serializedValue = value;
    }

    return {
      'value': serializedValue,
    };
  }
}

class GameInformationForReplay {
  final List<double> recordedTimes;
  final List<String> players;
  double totalTime;
  double initialTime;
  double elapsedTime;
  final String originalUrl;
  final String modifiedUrl;
  double finalTime;
  final String gameName;
  final String difficulty;
  final String gameId;
  final int nbOfPlayers;
  final GameMode gameMode;
  final int totalDifferences;
  final GameValues gameValues;
  final int timeToStart;
  final List<String> originalDifferencesUrls;
  final List<String> flashingDifferencesUrls;
  final List<String> cheatImages;
  final bool isObserving;

  GameInformationForReplay(
      {required this.recordedTimes,
      required this.players,
      required this.totalTime,
      required this.initialTime,
      required this.elapsedTime,
      required this.originalUrl,
      required this.modifiedUrl,
      required this.finalTime,
      required this.gameName,
      required this.difficulty,
      required this.gameId,
      required this.nbOfPlayers,
      required this.gameMode,
      required this.totalDifferences,
      required this.gameValues,
      required this.timeToStart,
      required this.originalDifferencesUrls,
      required this.flashingDifferencesUrls,
      required this.cheatImages,
      required this.isObserving});

  Map<String, dynamic> toJson() {
    return {
      'originalUrl': originalUrl,
      'modifiedUrl': modifiedUrl,
      'finalTime': finalTime,
      'gameName': gameName,
      'difficulty': difficulty,
      'gameId': gameId,
      'nbOfPlayers': nbOfPlayers,
      'gameMode': gameMode.index,
      'totalDifferences': totalDifferences,
      'gameValues': gameValues.toJson(),
      'timeToStart': timeToStart,
      'originalDifferencesUrls': originalDifferencesUrls,
      'flashingDifferencesUrls': flashingDifferencesUrls,
      'cheatImages': cheatImages,
      'isObserving': isObserving,
      'recordedTimes': recordedTimes,
      'players': players,
      'totalTime': totalTime,
      'initialTime': initialTime,
      'elapsedTime': elapsedTime,
    };
  }

  factory GameInformationForReplay.fromJson(Map<String, dynamic> json) {
    return GameInformationForReplay(
      originalUrl: json['originalUrl'],
      modifiedUrl: json['modifiedUrl'],
      finalTime: json['finalTime']?.toDouble() ?? 0.0,
      gameName: json['gameName'],
      difficulty: json['difficulty'],
      gameId: json['gameId'],
      nbOfPlayers: json['nbOfPlayers'] ?? 0,
      gameMode: GameModeExtension.fromValue(json['gameMode']),
      totalDifferences: json['totalDifferences'] ?? 0,
      gameValues: GameValues.fromJson(json['gameValues']),
      timeToStart: json['timeToStart'] ?? 0,
      originalDifferencesUrls:
          List<String>.from(json['originalDifferencesUrls']),
      flashingDifferencesUrls:
          List<String>.from(json['flashingDifferencesUrls']),
      cheatImages: List<String>.from(json['cheatImages']),
      isObserving: json['isObserving'],
      recordedTimes: json['recordedTimes'] != null
          ? (json['recordedTimes'] as List)
              .map<double>((item) => (item ?? 0.0).toDouble())
              .toList()
          : [],
      players: List<String>.from(json['players']),
      totalTime: json['totalTime']?.toDouble() ?? 0.0,
      initialTime: json['initialTime']?.toDouble() ?? 0.0,
      elapsedTime: json['elapsedTime']?.toDouble() ?? 0.0,
    );
  }
}

class ReplayAction {
  final double time;
  final String category;
  final ReplayInput input;

  ReplayAction(
      {required this.time, required this.category, required this.input});

  Map<String, dynamic> toJson() {
    return {
      'time': time,
      'category': category,
      'input': input.value,
    };
  }

  factory ReplayAction.fromJson(Map<String, dynamic> json) {
    return ReplayAction(
      time: (json['time']?.toDouble() ?? 0.0),
      category: json['category'],
      input: ReplayInput(
        value: json['input'],
      ),
    );
  }
}

class GameState {
  final int totalDifferences;
  final int differencesFoundTotal;
  final List<String> originalDifferencesUrls;

  Map<String, dynamic> toJson() {
    return {
      'totalDifferences': totalDifferences,
      'differencesFoundTotal': differencesFoundTotal,
      'originalDifferencesUrls': originalDifferencesUrls,
    };
  }

  GameState(
      {required this.totalDifferences,
      required this.differencesFoundTotal,
      required this.originalDifferencesUrls});

  factory GameState.fromJson(Map<String, dynamic> json) {
    return GameState(
      totalDifferences: json['totalDifferences'] ?? 0,
      differencesFoundTotal: json['differencesFoundTotal'] ?? 0,
      originalDifferencesUrls:
          List<String>.from(json['originalDifferencesUrls'] ?? []),
    );
  }
}

class GameStateSnapshot {
  final double time;
  final GameState state;

  GameStateSnapshot({required this.time, required this.state});

  Map<String, dynamic> toJson() {
    return {
      'time': time,
      'state': state.toJson(),
    };
  }

  factory GameStateSnapshot.fromJson(Map<String, dynamic> json) {
    return GameStateSnapshot(
      time: json['time']?.toDouble() ?? 0.0,
      state: GameState.fromJson(json['state'] ?? {}),
    );
  }
}

class Replay {
  final GameInformationForReplay gameDetails;
  final List<ReplayAction> actions;
  final List<GameStateSnapshot> snapshots;
  final DateTime createdAt;
  final String createdBy;
  

  Replay(
      {required this.gameDetails,
      required this.actions,
      required this.snapshots,
      required this.createdAt,
      required this.createdBy});

  Map<String, dynamic> toJson() {
    return {
      'gameDetails': gameDetails.toJson(),
      'actions': actions.map((e) => e.toJson()).toList(),
      'snapshots': snapshots.map((e) => e.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'createdBy': createdBy,
    };
  }

  factory Replay.fromJson(Map<String, dynamic> json) {
    return Replay(
      gameDetails: GameInformationForReplay.fromJson(json['gameDetails']),
      actions: (json['actions'] as List)
          .map((i) => ReplayAction.fromJson(i))
          .toList(),
      snapshots: (json['snapshots'] as List)
          .map((i) => GameStateSnapshot.fromJson(i as Map<String, dynamic>))
          .toList(),
      createdAt: DateTime.parse(json['createdAt']),
      createdBy: json['createdBy'],
    );
  }
}

class ReplayInformationToRestore {
  final GameInformationForReplay gameDetails;
  final List<ReplayAction> actions;
  final List<GameStateSnapshot> snapshots;

  ReplayInformationToRestore(
      {required this.gameDetails,
      required this.actions,
      required this.snapshots});
}
