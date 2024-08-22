import 'package:flutter_project/common/enum.dart';

class Game {
  int? observerNbr = 0;
  String? gameID;
  String? cardId;
  String? name;
  int? difficulty;
  BestTimes? classicSoloBestTimes;
  BestTimes? classic1v1BestTimes;
  String? originalImage;
  int? nbDifferences;
  int? likes;
  List<String>? awaitingPlayers;
  GameMode gameMode = GameMode.None;
  List<String>? playersWithAccess = [];
  GameAccessType? accessType = GameAccessType.Everyone;

  Game({
    this.observerNbr,
    this.gameID,
    this.cardId,
    this.name,
    this.difficulty,
    this.classicSoloBestTimes,
    this.classic1v1BestTimes,
    this.originalImage,
    this.nbDifferences,
    this.awaitingPlayers,
    this.playersWithAccess,
    this.likes,
  });

  // Factory constructor to create a Game object from a CardPreview object.
  factory Game.fromjson(Map<String, dynamic> json) {
    return Game(
      cardId: json['id'] as String,
      name: json['name'] as String,
      difficulty: json['difficulty'] as int,
      classicSoloBestTimes: BestTimes(
        firstPlace: BestTime(
          name: "Placeholder",
          time: TimeConcept(seconds: 0, minutes: 0),
        ), // You will need to replace these with actual values
        secondPlace: BestTime(
          name: "Placeholder",
          time: TimeConcept(seconds: 0, minutes: 0),
        ), // from the json, if available
        thirdPlace: BestTime(
          name: "Placeholder",
          time: TimeConcept(seconds: 0, minutes: 0),
        ),
      ),
      classic1v1BestTimes: BestTimes(
        firstPlace: BestTime(
          name: "Placeholder",
          time: TimeConcept(seconds: 0, minutes: 0),
        ),
        secondPlace: BestTime(
          name: "Placeholder",
          time: TimeConcept(seconds: 0, minutes: 0),
        ),
        thirdPlace: BestTime(
          name: "Placeholder",
          time: TimeConcept(seconds: 0, minutes: 0),
        ),
      ),
      originalImage: json['originalImage'] as String,
      //gameStatus: json['gameStatus'] ?? false, // Default to false if null.
      nbDifferences:
          json['nbrDifferences'] as int, // Can be null, so use 'as int?'.
      playersWithAccess: [],
      likes: json['likes'] as int,
    );
  }
}

class BestTimes {
  BestTime firstPlace;
  BestTime secondPlace;
  BestTime thirdPlace;

  BestTimes({
    required this.firstPlace,
    required this.secondPlace,
    required this.thirdPlace,
  });
}

class BestTime {
  String name;
  TimeConcept time;

  BestTime({
    required this.name,
    required this.time,
  });
}

class TimeConcept {
  int seconds;
  int minutes;

  TimeConcept({
    required this.seconds,
    required this.minutes,
  });
}

enum GameAccessType {
  Everyone,
  Friends,
  FriendsOfFriends,
}
