import 'package:audioplayers/audioplayers.dart';
import 'package:flutter_project/common/enum.dart';
import 'package:flutter_project/service/settings-service.dart';

class SoundService {
  static final SoundService _instance = SoundService._privateConstructor();
  final AudioPlayer _successSoundPlayer = AudioPlayer();
  final AudioPlayer _errorSoundPlayer = AudioPlayer();
  final AudioPlayer audioPlayerObserver = AudioPlayer();

  final double _volume = 0.2;
  Speed speed = Speed.NORMAL;

  factory SoundService() {
    return _instance;
  }

  static SoundService get instance => _instance;

  SoundService._privateConstructor() {
    _initializePlayers();
  }

  void _initializePlayers() {
    _successSoundPlayer.setVolume(_volume);
    _errorSoundPlayer.setVolume(_volume);
    audioPlayerObserver.setVolume(_volume);
    _successSoundPlayer.setSource(AssetSource('success.mp3'));
    _errorSoundPlayer.setSource(AssetSource('error.wav'));
    speed = Speed.NORMAL;
  }

  void setSpeed(Speed newSpeed) {
    speed = newSpeed;
    _successSoundPlayer.setPlaybackRate(speed.value);
    _errorSoundPlayer.setPlaybackRate(speed.value);
  }

  Future<void> playSuccess() async {
    await _successSoundPlayer.stop();
    await _successSoundPlayer
        .play(AssetSource(SettingsService.instance.successSound));
  }

  Future<void> playError() async {
    await _errorSoundPlayer.stop();
    await _errorSoundPlayer
        .play(AssetSource(SettingsService.instance.failureSound));
  }

  Future<void> playSound(Sound sound) async {
    audioPlayerObserver.stop();
    final soundFileName = sound == Sound.Yippee ? 'yippee.mp3' : 'boiii.mp3';
    await audioPlayerObserver.play(AssetSource(soundFileName));
    Future.delayed(const Duration(seconds: 3), () {
      audioPlayerObserver.stop();
    });
  }

  void pause() {
    _successSoundPlayer.pause();
    _errorSoundPlayer.pause();
  }

  void resume() {
    _successSoundPlayer.resume();
    _errorSoundPlayer.resume();
  }
}
