import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_project/common/enum.dart';
import 'package:flutter_project/dtos/channel-dto.dart';
import 'package:flutter_project/pages/game-screen.dart';
import 'package:flutter_project/pages/main-page.dart';
import 'package:flutter_project/service/delay-service.dart';
import 'package:flutter_project/service/game-data-service.dart';
import 'package:flutter_project/service/game-service.dart';
import 'package:flutter_project/service/replay-service.dart';
import 'package:flutter_project/service/settings-service.dart';
import 'package:flutter_project/service/sound-service.dart';

class VideoReplayControlWidget extends StatefulWidget {
  @override
  _VideoReplayControlWidgetState createState() =>
      _VideoReplayControlWidgetState();
}

class _VideoReplayControlWidgetState extends State<VideoReplayControlWidget> {
  bool isPaused = false;
  double progress = 0;
  Speed speed = Speed.NORMAL;
  bool isSaveButtonPressed = false;
  final GameService _gameService = GameService.instance;
  final DelayService _delayService = DelayService();
  final GameDataService _gameDataService = GameDataService();
  final SoundService _soundService = SoundService();
  late StreamSubscription<double> _timeSubscription;

  List<double> timeJumpQueue = [];

  ReplayService? _replayService;

  ReplayService getReplayService() {
    _replayService ??= ReplayService()
      ..initialize(
          _delayService, _gameService, _soundService, _gameDataService);
    return _replayService!;
  }

  @override
  void initState() {
    super.initState();
    _replayService = getReplayService();
    _timeSubscription =
        _replayService!.replayTimeStream.listen((double currentTime) {
      int currentIndex = _gameService.recordedTimes.indexOf(currentTime);
      if (currentIndex != -1) {
        double newProgress =
            currentIndex / (_gameService.recordedTimes.length - 1) * 100;
        if (newProgress != progress) {
          setState(() {
            progress = newProgress;
            _gameService.recordedTimeIndex = currentIndex;
          });
        }
      }
    });
  }

  double calculateProgress() {
    if (_gameService.recordedTimes.isEmpty) {
      return 0.0;
    }
    return _gameService.recordedTimeIndex /
        _gameService.recordedTimes.length *
        100;
  }

  bool ended() {
    return !getReplayService().isReplaying;
  }

  double getProgress() {
    if (_gameService.recordedTimes.isEmpty) {
      return 0.0;
    }
    return _gameService.recordedTimes.isNotEmpty
        ? (_gameService.recordedTimeIndex / _gameService.recordedTimes.length) *
            100
        : 0.0;
  }

  Speed getSpeed() {
    return speed;
  }

  void pause() {
    if (!ended()) {
      getReplayService().pause();
      isPaused = true;
    }
  }

  void onProgressBarChange(double newProgress) {
    if (!isPaused) {
      pause();
    }
    int newTimeIndex =
        (_gameService.recordedTimes.length * (newProgress / 100)).round();
    double clickedTime = _gameService.recordedTimes[newTimeIndex];
    print('Clicked time: $clickedTime');
    timeJumpQueue.add(clickedTime);
    restoreGameStateToTime(clickedTime);
    resetGameTimeToNearestRecordedTime(clickedTime);
  }

  void restoreGameStateToTime(double clickedTime) {
    GameService.instance.getReplayService().pause();
    GameService.instance
        .getReplayService()
        .restoreGameStateFromTime(clickedTime);
  }

  void resetGameTimeToNearestRecordedTime(double time) {
    double closestTime = findNearestRecordedTimeComparedToInput(time);
    _gameService.recordedTimeIndex =
        _gameService.recordedTimes.indexOf(closestTime);
    _gameService.time = closestTime;
  }

  double findNearestRecordedTimeComparedToInput(double time) {
    double minDiff = 100;
    double closestTime = -1;
    for (double recordedTime in _gameService.recordedTimes) {
      double diff = (recordedTime - time).abs();
      if (diff < minDiff) {
        minDiff = diff;
        closestTime = recordedTime;
      }
    }
    return closestTime;
  }

  void restart() {
    GameService.instance.getReplayService().restart();
    isPaused = false;
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => GameScreen()),
    );
  }

  void resume() {
    setState(() {
      isPaused = false;
    });
    GameService.instance.getReplayService().resume();
  }

  void selectSpeed(Speed newSpeed) {
    setState(() {
      speed = newSpeed;
    });
    GameService.instance.getReplayService().changeSpeed(newSpeed);
  }

  void exit() {
    GameService.instance.getReplayService().stop();
    GameService.instance.getReplayService().storeActions = true;
    getReplayService().isReplayMode = false;
    getReplayService().isReplayingReplay = false;

    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => MainPage()),
    );
  }

  void save() {
    if (!isSaveButtonPressed) {
      GameService.instance.getReplayService().postReplay();
      setState(() {
        isSaveButtonPressed = true;
      });
    }
  }

  @override
  void dispose() {
    _timeSubscription.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.all(0),
      color: Colors.transparent,
      shadowColor: Colors.black.withOpacity(0.1),
      elevation: 3,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Slider(
              value: progress,
              min: 0,
              max: 100,
              divisions: 100,
              label: "${progress.toInt()}%",
              // onChanged: (newProgress) {
              //   setState(() {
              //     progress = newProgress;
              //   });
              // },
              onChanged: null,
              onChangeEnd: onProgressBarChange,
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                IconButton(
                  icon: Icon(Icons.restart_alt, size: 24),
                  onPressed: restart,
                ),
                IconButton(
                  icon:
                      Icon(isPaused ? Icons.play_arrow : Icons.pause, size: 24),
                  onPressed: isPaused ? resume : pause,
                ),
                ChoiceChip(
                  label: Text('x1', style: TextStyle(fontSize: 14)),
                  selected: speed == Speed.NORMAL,
                  onSelected: (_) => selectSpeed(Speed.NORMAL),
                ),
                ChoiceChip(
                  label: Text('x2', style: TextStyle(fontSize: 14)),
                  selected: speed == Speed.X2,
                  onSelected: (_) => selectSpeed(Speed.X2),
                ),
                ChoiceChip(
                  label: Text('x4', style: TextStyle(fontSize: 14)),
                  selected: speed == Speed.X4,
                  onSelected: (_) => selectSpeed(Speed.X4),
                ),
                if (!getReplayService().isReplayingReplay)
                  ElevatedButton(
                    onPressed: isSaveButtonPressed ? null : save,
                    child: Text(
                        SettingsService.instance.language == Language.fr
                            ? "Enregistrer"
                            : "Save",
                        style: TextStyle(fontSize: 14)),
                    style: ElevatedButton.styleFrom(
                      padding:
                          EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      backgroundColor: isSaveButtonPressed
                          ? Colors.grey
                          : Theme.of(context).primaryColor,
                    ),
                  ),
                ElevatedButton(
                  onPressed: exit,
                  child: Text(
                      SettingsService.instance.language == Language.fr
                          ? "Quitter"
                          : "Quit",
                      style: TextStyle(fontSize: 14)),
                  style: ElevatedButton.styleFrom(
                    primary: Colors.red,
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
