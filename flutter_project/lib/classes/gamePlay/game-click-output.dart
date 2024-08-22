class GameClickOutputDto {
  bool valid;
  String playerName;
  int? penaltyTime;
  String? differenceNaturalOverlay; // faire disparaitre
  String? differenceFlashOverlay; // L'image avec le contour jaune

  GameClickOutputDto({
    required this.valid,
    required this.playerName,
    this.penaltyTime,
    this.differenceNaturalOverlay,
    this.differenceFlashOverlay,
  });

  static GameClickOutputDto fromJson(Map<String, dynamic> json) {
    return GameClickOutputDto(
      valid: json['valid'],
      playerName: json['playerName'],
      penaltyTime: json.containsKey('penaltyTime') ? json['penaltyTime'] : null,
      differenceNaturalOverlay: json.containsKey('differenceNaturalOverlay')
          ? json['differenceNaturalOverlay']
          : null,
      differenceFlashOverlay: json.containsKey('differenceFlashOverlay')
          ? json['differenceFlashOverlay']
          : null,
    );
  }
}
