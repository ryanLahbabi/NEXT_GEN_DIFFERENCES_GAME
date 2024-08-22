import 'package:flutter/material.dart';
import 'package:flutter_project/widget/game-selection-widgets/create-games-widget.dart';
import 'package:flutter_project/widget/game-selection-widgets/observer-widget.dart';
import 'package:flutter_project/widget/game-selection-widgets/time-limited-widget.dart';
import 'package:flutter_project/widget/game-selection-widgets/waiting-games-widget.dart';

import '../../classes/applocalization.dart';

class TopBarWidget extends StatelessWidget {
  final bool isTimed; // Added isTimed property

  // Modify constructor to include isTimed
  TopBarWidget({Key? key, this.isTimed = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;
    final String timeLimitedPath = appLocalizations.translate('CREATE_TIME_LIMITED') ?? '';
    final String waitingGamesLimitedPath = appLocalizations.translate('WAITING_GAMES') ?? '';
    final String observeGamePath = appLocalizations.translate('OBSERVE_IN_PROGRESS_GAME') ?? '';
    final String createNewGamePath = appLocalizations.translate('CREATE_NEW_GAME') ?? '';

    String waitingGamesAsset =
        isTimed ? timeLimitedPath : waitingGamesLimitedPath;
    String createNewGameAsset =
        isTimed ? observeGamePath : createNewGamePath;
    String observeGameAsset = isTimed ? '' : observeGamePath;

    return Container(
      child: Row(
        children: [
          _buildTopBarItem(
              imageAsset: waitingGamesAsset,
              onTap: () {
                if (isTimed) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => const TimeLimitedWidget()),
                  );
                } else {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => const WaitingGameWidget()),
                  );
                }
              }),
          _buildTopBarItem(
            imageAsset: createNewGameAsset,
            onTap: () {
              if (isTimed) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const ObserverWidget(
                            isTimed: true,
                          )),
                );
              } else {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const CreateGameWidget()),
                );
              }
            },
          ),
          // Third Image (Observe Game)
          _buildTopBarItem(
            imageAsset: observeGameAsset,
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                  builder: (context) => const ObserverWidget(isTimed: false)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopBarItem({
    required String imageAsset,
    required VoidCallback onTap,
  }) {
    return Container(
      padding: EdgeInsets.only(left: 16.0),
      child: GestureDetector(
        onTap: onTap,
        child: ClipRRect(
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20.0),
            topRight: Radius.circular(20.0),
          ),
          child: imageAsset.isNotEmpty
              ? Image.asset(
                  imageAsset,
                  fit: BoxFit.cover,
                  width: 350.0,
                  height: 50.0,
                )
              : Container(),
        ),
      ),
    );
  }
}
