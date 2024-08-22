enum GameMode {
  Classic1v1,
  ClassicSolo,
  LimitedTimeCoop,
  LimitedTimeSolo,
  ClassicDeathMatch,
  LimitedTimeDeathMatch,
  None,
}

extension GameModeExtension on GameMode {
  static GameMode fromValue(int value) {
    switch (value) {
      case 0:
        return GameMode.Classic1v1;
      case 1:
        return GameMode.ClassicSolo;
      case 2:
        return GameMode.LimitedTimeCoop;
      case 3:
        return GameMode.LimitedTimeSolo;
      case 4:
        return GameMode.ClassicDeathMatch;
      case 5:
        return GameMode.LimitedTimeDeathMatch;
      case 6:
        return GameMode.None;
      default:
        throw ArgumentError('Invalid GameMode value: $value');
    }
  }
}

enum PlayerConnectionStatus {
  AttemptingToJoin,
  Left,
  Joined,
}

enum GameConnectionAttemptResponseType {
  Starting,
  Pending,
  Cancelled,
  Rejected,
}

enum Difficulty {
  Easy,
  Hard,
  None,
}

enum Sound {
  Yippee,
  Boiii,
}

enum Speed {
  NORMAL,
  X2,
  X4,
}

extension SpeedValue on Speed {
  double get value {
    switch (this) {
      case Speed.NORMAL:
        return 1;
      case Speed.X2:
        return 2;
      case Speed.X4:
        return 4;
      default:
        return 1;
    }
  }
}
