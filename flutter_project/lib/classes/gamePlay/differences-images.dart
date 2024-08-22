class DifferenceImages {
  String? differenceNaturalOverlay;
  String? differenceFlashOverlay;
  int? index;

  Map<String, dynamic> toJson() {
    return {
      'differenceNaturalOverlay': differenceNaturalOverlay,
      'differenceFlashOverlay': differenceFlashOverlay,
      'index': index,
    };
  }

  DifferenceImages({
    this.differenceNaturalOverlay,
    this.differenceFlashOverlay,
    this.index,
  });
}
