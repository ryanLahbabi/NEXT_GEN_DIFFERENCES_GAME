// ignore_for_file: use_build_context_synchronously

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_project/dtos/channel-dto.dart';
import 'package:flutter_project/dtos/replay-dto.dart';
import 'package:flutter_project/environnment.dart';
import 'package:flutter_project/pages/game-screen.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:flutter_project/service/delay-service.dart';
import 'package:flutter_project/service/game-data-service.dart';
import 'package:flutter_project/service/game-service.dart';
import 'package:flutter_project/service/replay-service.dart';
import 'package:flutter_project/service/settings-service.dart';
import 'package:flutter_project/service/sound-service.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

class ReplayTableWidget extends StatefulWidget {
  @override
  _ReplayTableWidgetState createState() => _ReplayTableWidgetState();
}

class _ReplayTableWidgetState extends State<ReplayTableWidget> {
  final String baseUrl = Environnment.httpLink;

  List<String> replayDates = [];
  bool isLoading = false;
  OverlayEntry? loadingOverlay;
  final SoundService _soundService = SoundService();
  final DelayService _delayService = DelayService();
  final GameDataService _gameDataService = GameDataService();
  final GameService _gameService = GameService.instance;
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
    getReplayDates();
  }

  String getToken() {
    return AuthService.instance.token;
  }

  String getUsername() {
    return AuthService.instance.username;
  }

  void hideLoadingOverlay() {
    if (loadingOverlay != null) {
      loadingOverlay!.remove();
      loadingOverlay = null;
    }
  }

  void showLoadingOverlay(BuildContext context) {
    if (loadingOverlay != null) return;

    loadingOverlay = OverlayEntry(
      builder: (context) => const Stack(
        children: <Widget>[
          Opacity(
            opacity: 0.5,
            child: ModalBarrier(dismissible: false, color: Colors.grey),
          ),
          Center(child: CircularProgressIndicator()),
        ],
      ),
    );

    Overlay.of(context).insert(loadingOverlay!);
  }

  Future<void> getReplayDates() async {
    setState(() {
      isLoading = true;
    });
    final response = await http.get(
      Uri.parse('$baseUrl/replays/dates'),
      headers: {'Authorization': 'Bearer ${getToken()}'},
    );
    if (response.statusCode == 200) {
      final List<dynamic> dates = jsonDecode(response.body);
      replayDates = dates.cast<String>();
    }
    setState(() {
      isLoading = false;
    });
  }

  Future<Replay> getReplayByDate(String date) async {
    // setState(() {
    //   isLoading = true;
    // });
    final jsonResponse = await http.get(
      Uri.parse('$baseUrl/replays/$date'),
      headers: {'Authorization': 'Bearer ${getToken()}'},
    );
    print("Response: ${jsonResponse.body}");
    // setState(() {
    //   isLoading = false;
    // });
    if (jsonResponse.statusCode == 200) {
      return Replay.fromJson(jsonDecode(jsonResponse.body));
    } else {
      return Future.value(null);
    }
  }

  String formatDateString(String dateStr) {
    try {
      DateTime dateTime = DateTime.parse(dateStr);
      // Add four hours to the DateTime object
      DateTime adjustedDateTime = dateTime.add(Duration(hours: -4));
      return DateFormat('yyyy-MM-dd – kk:mm').format(adjustedDateTime);
    } catch (e) {
      print("Error parsing date: $e");
      return dateStr;
    }
  }

  Future<void> selectReplay(String date) async {
    if (isLoading) return;

    showLoadingOverlay(context);
    try {
      final replay = await getReplayByDate(date);
      if (replay == null) {
        hideLoadingOverlay();
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text('Error'),
            content: Text(
                'Failed to load the replay for date $date. Please try again later.'),
            actions: <Widget>[
              TextButton(
                child: Text('OK'),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
        );
        return;
      }

      getReplayService().isReplayingReplay = true;
      getReplayService().isReplayMode = true;

      _gameService.initializeReplayListener();
      getReplayService().setReplay(replay);

      hideLoadingOverlay();
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => GameScreen(),
        ),
      );
    } catch (e, stackTrace) {
      print("Error loading replay for date $date: $e");
      print('Stack trace: $stackTrace');
      hideLoadingOverlay();
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Error'),
          content: Text(
              'Failed to load the replay for date $date. Please try again later.'),
          actions: <Widget>[
            TextButton(
              child: Text('OK'),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : replayDates.isNotEmpty
              ? ListView.builder(
                  itemCount: replayDates.length,
                  itemBuilder: (context, index) {
                    final replayDate = replayDates[index];
                    final formattedDate = formatDateString(replayDate);
                    return ListTile(
                      title: Text(
                          SettingsService.instance.language == Language.fr
                              ? "Reprise Vidéo :$formattedDate"
                              : "Replay: $formattedDate"),
                      trailing: IconButton(
                        icon: Icon(Icons.delete, color: Colors.red[800]),
                        onPressed: () {
                          http.post(
                            Uri.parse(
                                '${Environnment.httpLink}/replays/delete/${replayDate}'),
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': 'Bearer ${getToken()}',
                            },
                          );
                          // getReplayService().resetEveryValueInTheGame();
                          getReplayService().isReplayingReplay = true;
                          setState(() {
                            replayDates.remove(replayDate);
                          });
                        },
                        iconSize: 40,
                      ),
                      onTap: () => selectReplay(replayDate),
                    );
                  },
                )
              : Center(
                  child: Text(SettingsService.instance.language == Language.fr
                      ? "Aucune reprise vidéo disponible"
                      : "No replays available"),
                ),
    );
  }
}
