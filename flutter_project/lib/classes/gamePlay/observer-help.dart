class ObserverHelpDTO {
  String gameId;
  ObserverHelpCoordinates zoneCoordinates;
  String? targetPlayerName;

  ObserverHelpDTO(
    this.gameId,
    this.zoneCoordinates,
    this.targetPlayerName,
  );

  ObserverHelpDTO.fromJson(Map<String, dynamic> json)
      : gameId = json['gameId'],
        zoneCoordinates =
            ObserverHelpCoordinates.fromJson(json['zoneCoordinates']),
        targetPlayerName = json['targetPlayerName'];

  Map<String, dynamic> toJson() {
    return {
      'gameId': gameId,
      'zoneCoordinates': zoneCoordinates,
      'targetPlayerName': targetPlayerName != 'all' ? targetPlayerName : null,
    };
  }
}

class ObserverHelpResponseDTO {
  String observerUsername;
  ObserverHelpCoordinates zoneCoordinates;

  ObserverHelpResponseDTO(this.observerUsername, this.zoneCoordinates);

  ObserverHelpResponseDTO.fromJson(Map<String, dynamic> json)
      : observerUsername = json['observerUsername'],
        zoneCoordinates =
            ObserverHelpCoordinates.fromJson(json['zoneCoordinates']);

  Map<String, dynamic> toJson() {
    return {
      'observerUsername': observerUsername,
      'zoneCoordinates': zoneCoordinates,
    };
  }
}

class ObserverHelpCoordinates {
  Coordinates upperLeft;
  Coordinates lowerRight;

  ObserverHelpCoordinates(
    this.upperLeft,
    this.lowerRight,
  );

  ObserverHelpCoordinates.fromJson(Map<String, dynamic> json)
      : upperLeft = Coordinates.fromJson(json['upperLeft']),
        lowerRight = Coordinates.fromJson(json['lowerRight']);

  Map<String, dynamic> toJson() {
    return {
      'upperLeft': upperLeft,
      'lowerRight': lowerRight,
    };
  }
}

class Coordinates {
  final int x;
  final int y;

  Coordinates(this.x, this.y);

  Coordinates.fromJson(Map<String, dynamic> json)
      : x = json['x'],
        y = json['y'];

  Map<String, dynamic> toJson() {
    return {
      'x': x,
      'y': y,
    };
  }
}
