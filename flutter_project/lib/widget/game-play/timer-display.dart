import 'dart:async';

import 'package:flutter/material.dart';

class TimerDisplayWidget extends StatefulWidget {
  final Stream<int> timerStream;

  const TimerDisplayWidget({Key? key, required this.timerStream})
      : super(key: key);

  @override
  _TimerDisplayWidgetState createState() => _TimerDisplayWidgetState();
}

class _TimerDisplayWidgetState extends State<TimerDisplayWidget> {
  int _currentTime = 0;
  StreamSubscription<int>? _timeSubscription;

  @override
  void initState() {
    super.initState();
    _timeSubscription = widget.timerStream.listen((time) {
      if (mounted) {
        setState(() {
          _currentTime = time;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Text(
      formatTime(_currentTime),
      style: const TextStyle(color: Colors.white),
    );
  }

  String formatTime(int timeInSeconds) {
    final minutes = (timeInSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (timeInSeconds % 60).toString().padLeft(2, '0');
    return "$minutes:$seconds";
  }

  @override
  void dispose() {
    _timeSubscription?.cancel();
    super.dispose();
  }
}
