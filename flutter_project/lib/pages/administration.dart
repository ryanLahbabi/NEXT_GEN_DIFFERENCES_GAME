import 'package:flutter/material.dart';
import 'package:flutter_project/dtos/cards-dto.dart';
import 'package:flutter_project/widget/game-selection-widgets/game-cards-widget.dart';
import 'package:flutter_project/widget/tools-widgets/frame-widget.dart';
import 'package:flutter_project/widget/tools-widgets/title-widget.dart';

import '../dtos/channel-dto.dart';
import '../service/game-list-manager-service.dart';
import '../service/settings-service.dart';

class AdminPage extends StatefulWidget {
  const AdminPage({super.key});

  @override
  _AdminPage createState() => _AdminPage();
}

class _AdminPage extends State<AdminPage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage(
              SettingsService.instance.theme ==  Themes.dark
                  ? 'assets/dark_background.png'
                  :
              'assets/Postboard_background.png',
            ),
            fit: BoxFit.cover,
          ),
        ),
        child: Column(
          children: [
            Stack(
              children: [
                Positioned(
                  child: Padding(
                    padding: const EdgeInsets.only(top: 20.0),
                    child: Container(
                      width: 1300,
                      height: 60,
                      child: const CustomPaperWidget(
                        text: 'Administration des jeux',
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Stack(
              alignment: Alignment.center,
              children: [
                FrameWidget(
                  type: 'admin',
                  child: ScrollbarTheme(
                    data: ScrollbarThemeData(
                      thumbColor: MaterialStateProperty.all(
                          const Color.fromARGB(255, 218, 128, 226)),
                      thickness: MaterialStateProperty.all(15.0),
                      radius: const Radius.circular(5),
                      crossAxisMargin: 4.0,
                      mainAxisMargin: 4.0,
                    ),
                    child: Scrollbar(
                      controller: _scrollController,
                      thumbVisibility: true,
                      child: GridView.count(
                        controller: _scrollController,
                        padding: const EdgeInsets.only(right: 30),
                        crossAxisCount: 2,
                        childAspectRatio: 2.1,
                        crossAxisSpacing: 90,
                        mainAxisSpacing: 12,
                        children: List.generate(
                          GameListManagerService.instance.games.length,
                          (index) {
                            return GameCardWidget(
                              gameMode: 4,
                              cardID: GameListManagerService
                                  .instance.games[index].cardId,
                              name: GameListManagerService
                                  .instance.games[index].name
                                  .toString(),
                              image: GameListManagerService
                                  .instance.games[index].originalImage
                                  .toString(),
                              difficulty: GameListManagerService
                                  .instance.games[index].difficulty
                                  .toString(),
                              awaitingPlayers: ['Player 1', 'Player 2'],
                              type: 'admin',
                              sendSelection: () {},
                              isTimed: false,
                              nbDifferences: GameListManagerService
                                  .instance.games[index].nbDifferences,
                                gameAccessType: GameAccessType.Everyone
                            );
                          },
                        ),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 200,
                  right: 30,
                  child: Image.asset('assets/delete-games.png',
                      width: 150, height: 150),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
