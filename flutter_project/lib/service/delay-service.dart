import 'dart:async';

import 'package:flutter_project/classes/replay/timer.dart';
import 'package:flutter_project/common/enum.dart';
import 'package:flutter_project/service/game-data-service.dart';

class DelayService {
  bool timeIsPaused = false;
  Speed speed = Speed.NORMAL;
  List<CustomTimer> delays = [];
  List<CustomTimer> cycles = [];

  static final DelayService _instance = DelayService._internal();

  factory DelayService() {
    print("DelayService factory called");
    return _instance;
  }

  DelayService._internal();

  static DelayService get instance => _instance;

  void changeSpeed(Speed newSpeed) {
    bool timeWasPaused = timeIsPaused;
    speed = newSpeed;
    delays.forEach((delay) => delay.speed = speed);
    cycles.forEach((cycle) => cycle.speed = speed);
    if (!timeWasPaused) {
      resumeTime();
    }
  }

  void pauseTime() {
    pauseDelays();
    pauseCycles();
    timeIsPaused = true;
  }

  void resumeTime() {
    delays.forEach((delay) => delay.resume());
    cycles.forEach((cycle) => cycle.resume());
    timeIsPaused = false;
  }

  void clearDelays() {
    pauseDelays();
    delays = [];
  }

  void clearCycles() {
    pauseCycles();
    cycles = [];
  }

  Future<void> wait(double milliseconds) async {
    print('wait');
    Completer<void> completer = Completer<void>();
    // CustomTimer delayTimer = CustomTimer(() => completer.complete(), TimerConfig(delay: milliseconds, speed: speed, repeat: false));
    // delays.add(delayTimer);
    return completer.future;
  }

  void doCyclically(double intervalMs, void Function() callback) {
    print('doCyclically');
    cycles.add(CustomTimer(
        callback, TimerConfig(delay: intervalMs, speed: speed, repeat: true)));
  }

  void pauseDelays() {
    print('pauseDelays');
    delays.forEach((delay) => delay.pause());
  }

  void pauseCycles() {
    print('pauseCycles');
    cycles.forEach((cycle) => cycle.pause());
    GameDataService().showCheat = false;
  }
}
