class PlayerInfo {
  String username;
  int score;

  PlayerInfo({required this.username, this.score = 0});

  @override
  String toString() {
    return 'PlayerInfo{username: $username, score: $score}';
  }
}
