class GameEndData {
  final int finalTime;
  final List<PlayerResult> players;

  GameEndData({required this.finalTime, required this.players});

  factory GameEndData.fromJson(Map<String, dynamic> json) {
    var playersList = json['players'] as List;
    List<PlayerResult> players =
        playersList.map((i) => PlayerResult.fromJson(i)).toList();
    return GameEndData(
      finalTime: json['finalTime'],
      players: players,
    );
  }
}

class PlayerResult {
  final String name;
  final bool winner;
  final bool deserter;

  PlayerResult(
      {required this.name, required this.winner, required this.deserter});

  factory PlayerResult.fromJson(Map<String, dynamic> json) {
    return PlayerResult(
      name: json['name'].toString(),
      winner: json['winner'],
      deserter: json['deserter'],
    );
  }
}
