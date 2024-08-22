
import 'dart:async';
import 'package:flutter_project/common/enum.dart';

class TimerConfig {
  final double delay;
  final Speed speed;
  final bool repeat;

  TimerConfig({required this.delay, required this.speed, required this.repeat});
}

class CustomTimer {
  Speed speed;
  Timer? timer;
  late int start;
  double remaining;
  final void Function() callback;
  final bool repeat;

  CustomTimer(this.callback, TimerConfig config)
      : speed = config.speed,
        remaining = config.delay,
        repeat = config.repeat {
    resume();
  }

  void pause() {
    if (timer == null) return;

    timer!.cancel();
    timer = null;
    if (!repeat) remaining -= (DateTime.now().millisecondsSinceEpoch - start) * speed.value;
  }

  void resume() {
    if (timer != null) return;

    start = DateTime.now().millisecondsSinceEpoch;
    if (repeat) {
      timer = Timer.periodic(Duration(milliseconds: remaining ~/ speed.value), (Timer t) => callback());
    } else {
      timer = Timer(Duration(milliseconds: remaining ~/ speed.value), callback);
    }
  }
}