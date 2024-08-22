class GameValues {
  String timerTime;
  int penaltyTime;
  String gainedTime;

  GameValues({
    this.timerTime = "",
    this.penaltyTime = 0,
    this.gainedTime = "",
  });

  Map<String, dynamic> toJson() {
    return {
      'timerTime': timerTime,
      'penaltyTime': penaltyTime,
      'gainedTime': gainedTime,
    };
  }

  factory GameValues.fromJson(Map<String, dynamic> json) {
    final timerTime = json['timerTime'];
    final timerTimeString = timerTime is int ? timerTime.toString() : timerTime;

    final gainedTime = json['gainedTime'];
    final gainedTimeString =
        gainedTime is int ? gainedTime.toString() : gainedTime;

    return GameValues(
      timerTime: timerTimeString ?? "",
      penaltyTime: json['penaltyTime'] ?? 0,
      gainedTime: gainedTimeString ?? "",
    );
  }
}
