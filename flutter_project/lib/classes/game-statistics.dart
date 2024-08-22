class GameStatistics {
  num gamesPlayed;
  num gamesWinned;
  num averageDifferencesFound;
  num averageTimePlayed;

  GameStatistics({
    required this.gamesPlayed,
    required this.gamesWinned,
    required this.averageDifferencesFound,
    required this.averageTimePlayed,
  });

  factory GameStatistics.fromJson(Map<String, dynamic> json) {
    return GameStatistics(
      gamesPlayed: json['gamesPlayed'],
      gamesWinned: json['gamesWinned'],
      averageDifferencesFound: json['averageDifferencesFound'],
      averageTimePlayed: json['averageTimePlayed'],
    );
  }
}
