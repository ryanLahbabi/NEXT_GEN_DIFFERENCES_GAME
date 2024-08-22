import 'package:flutter/material.dart';
import 'package:flutter_project/classes/game-statistics.dart'; // Import the GameStatistics class
import 'package:flutter_project/widget/profile/replay-table-widget.dart';

import '../classes/applocalization.dart';

class StatisticTabWidget extends StatefulWidget {
  final GameStatistics firstTabStatistics;
  final GameStatistics secondTabStatistics;
  final GameStatistics thirdTabStatistics;
  StatisticTabWidget({super.key, required dynamic generalGameStatistics})
      : firstTabStatistics =
            GameStatistics.fromJson(generalGameStatistics['generalGameData']),
        secondTabStatistics =
            GameStatistics.fromJson(generalGameStatistics['classicDeathMatch']),
        thirdTabStatistics = GameStatistics.fromJson(
            generalGameStatistics['limitedTimeDeathMatch']);

  @override
  _StatisticTabWidgetState createState() => _StatisticTabWidgetState();
}

class _StatisticTabWidgetState extends State<StatisticTabWidget> {
  @override
  Widget build(BuildContext context) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    return Container(
      decoration: BoxDecoration(
          border: Border.all(color: Colors.indigo),
          borderRadius: const BorderRadius.all(Radius.circular(30))),
      child: DefaultTabController(
        length: 4,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              child: TabBar(
                tabs: [
                  Tab(text: appLocalizations.translate('GLOBAL_STATS') ?? ''),
                  Tab(text: appLocalizations.translate('CLASSIC_MODE') ?? ''),
                  Tab(
                      text: appLocalizations.translate('TIME_LIMITED_MODE') ??
                          ''),
                  Tab(text: appLocalizations.translate('REPLAY') ?? ''),
                ],
              ),
            ),
            SizedBox(height: 16),
            Container(
              height: 175, // Adjust the height as needed
              child: TabBarView(
                children: [
                  // Content for the first tab
                  SizedBox(
                    width: 100,
                    child: StatisticContentWidget(
                      value1: widget.firstTabStatistics.gamesPlayed.toString(),
                      value2: widget.firstTabStatistics.gamesWinned.toString(),
                      value3: widget.firstTabStatistics.averageDifferencesFound
                          .toString(),
                      value4: widget.firstTabStatistics.averageTimePlayed
                          .toString(),
                    ),
                  ),
                  // Content for the second tab
                  SizedBox(
                    width: 100,
                    child: StatisticContentWidget(
                      value1: widget.secondTabStatistics.gamesPlayed.toString(),
                      value2: widget.secondTabStatistics.gamesWinned.toString(),
                      value3: widget.secondTabStatistics.averageDifferencesFound
                          .toString(),
                      value4: widget.secondTabStatistics.averageTimePlayed
                          .toString(),
                    ),
                  ),
                  // Content for the third tab
                  SizedBox(
                    width: 100,
                    child: StatisticContentWidget(
                      value1: widget.thirdTabStatistics.gamesPlayed.toString(),
                      value2: widget.thirdTabStatistics.gamesWinned.toString(),
                      value3: widget.thirdTabStatistics.averageDifferencesFound
                          .toString(),
                      value4: widget.thirdTabStatistics.averageTimePlayed
                          .toString(),
                    ),
                  ),
                  SizedBox(
                    width: 100,
                    // Content for the fourth tab, ReplayTableWidget
                    child: ReplayTableWidget(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class StatisticContentWidget extends StatelessWidget {
  final String value1;
  final String value2;
  final String value3;
  final String value4;

  const StatisticContentWidget({
    Key? key,
    required this.value1,
    required this.value2,
    required this.value3,
    required this.value4,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    String label1 = appLocalizations.translate('NUMBER_OF_PLAYED_GAME') ?? '';
    String label2 = appLocalizations.translate('NUMBER_OF_GAME_WON') ?? '';
    String label3 =
        appLocalizations.translate('AVERAGE_FOUND_DIFFERENCES') ?? '';
    String label4 = appLocalizations.translate('AVERAGE_GAME_TIME') ?? '';

    return Center(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              _StatisticEntryWidget(
                value: value1,
                label: label1,
                isInteger: true,
              ),
              const SizedBox(height: 40),
              _StatisticEntryWidget(
                value: value3,
                label: label3,
                isInteger: false,
              ),
            ],
          ),
          Column(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              _StatisticEntryWidget(
                value: value2,
                label: label2,
                isInteger: true,
              ),
              const SizedBox(height: 40),
              _StatisticEntryWidget(
                value: value4,
                label: label4,
                isInteger: false,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatisticEntryWidget extends StatelessWidget {
  final String value;
  final String label;
  final bool isInteger;

  const _StatisticEntryWidget({
    Key? key,
    required this.value,
    required this.label,
    required this.isInteger,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          Text(
            isInteger
                ? (double.parse(value)).round().toString()
                : (double.parse(value)).toStringAsFixed(2),
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
          ),
          const SizedBox(width: 10),
          Text(label, style: const TextStyle(fontSize: 15)),
        ],
      ),
    );
  }
}
