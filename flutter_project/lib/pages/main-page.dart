import 'package:flutter/material.dart';
import 'package:flutter_project/common/enum.dart';
import 'package:flutter_project/pages/profile-page.dart';
import 'package:flutter_project/pages/settings.dart';
import 'package:flutter_project/service/game-data-service.dart';
import 'package:flutter_project/service/message-service.dart';
import 'package:flutter_project/widget/friends/askfriend-widget.dart';
import 'package:flutter_project/widget/friends/searchfriend-widget.dart';
import 'package:flutter_project/widget/game-selection-widgets/time-limited-widget.dart';
import 'package:flutter_project/widget/game-selection-widgets/waiting-games-widget.dart';
import 'package:flutter_project/widget/main-page-widget.dart';
import 'package:flutter_project/widget/message-widget.dart';

import '../classes/applocalization.dart';
import '../dtos/channel-dto.dart';
import '../service/settings-service.dart';

class MainPage extends StatefulWidget {
  const MainPage({Key? key}) : super(key: key);

  @override
  _MainPageState createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  var playerName;
  var gameMode;

  @override
  void initState() {
    super.initState();
    /*CommunicationSocket.instance.init();
    CommunicationSocket.on(FromServer.START_APP, (data) {
      print(data);
    });*/
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;
    final String imagePath =
        appLocalizations.translate('GAME_OF_DIFFERENCE') ?? '';

    return MaterialApp(
      home: Scaffold(
        drawer: const MessageWidget(),
        resizeToAvoidBottomInset: false,
        body: Stack(
          children: [
            Positioned.fill(
              child: Image.asset(
                SettingsService.instance.theme == Themes.dark
                    ? 'assets/dark_background.png'
                    : 'assets/Postboard_background.png',
                fit: BoxFit.cover,
              ),
            ),
            Builder(builder: (context) {
              return Positioned(
                top: 35,
                left: 1060,
                child: GestureDetector(
                  onTap: () {
                    Scaffold.of(context).openDrawer();
                    MessageService.instance.markMessagesAsRead(
                        MessageService.instance.focusedConversationId);
                  },
                  child: Stack(
                    children: <Widget>[
                      Icon(
                        Icons.message_outlined,
                        size: 40,
                        color: SettingsService.instance.theme == Themes.dark
                            ? Colors.white
                            : const Color.fromARGB(255, 49, 49, 49),
                      ),
                      Positioned(
                        top: 0,
                        right: 0,
                        child: ValueListenableBuilder<bool>(
                          valueListenable:
                              MessageService.instance.hasUnreadMessage,
                          builder: (context, hasUnread, child) {
                            if (hasUnread) {
                              return Container(
                                width: 18,
                                height: 18,
                                decoration: BoxDecoration(
                                  color: Colors.red,
                                  shape: BoxShape.circle,
                                  border:
                                      Border.all(color: Colors.white, width: 1),
                                ),
                              );
                            } else {
                              return Container();
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
            Positioned(
              top: 30,
              left: 850,
              child: GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                      MaterialPageRoute(builder: (context) => const SettingsPage()));
                },
                child: Icon(
                  Icons.app_settings_alt,
                  size: 40,
                  color: SettingsService.instance.theme == Themes.dark
                      ? Colors.white
                      : const Color.fromARGB(255, 49, 49, 49),
                ),
              ),
            ),
            Positioned(
              top: 30,
              left: 1000,
              child: GestureDetector(
                onTap: () {
                  Navigator.of(context).push(MaterialPageRoute(
                      builder: (context) => AskFriendWidget()));
                },
                child: Image.asset(
                  'assets/ask_friend.jpg',
                  width: 50,
                  color: SettingsService.instance.theme == Themes.dark
                      ? Colors.white
                      : const Color.fromARGB(255, 49, 49, 49),
                ),
              ),
            ),
            Positioned(
              top: 30,
              left: 920,
              child: GestureDetector(
                onTap: () {
                  Navigator.of(context).push(MaterialPageRoute(
                      builder: (context) => SearchFriendWidget()));
                },
                child: Image.asset(
                  'assets/search_friends.png',
                  width: 50,
                  color: SettingsService.instance.theme == Themes.dark
                      ? Colors.white
                      : const Color.fromARGB(255, 49, 49, 49),
                ),
              ),
            ),
            Positioned(
              top: 30,
              left: 1127,
              child: GestureDetector(
                onTap: () {
                  Navigator.of(context).push(
                      MaterialPageRoute(builder: (context) => const ProfilePage()));
                },
                child: Icon(
                  Icons.person_outlined,
                  size: 40,
                  color: SettingsService.instance.theme == Themes.dark
                      ? Colors.white
                      : const Color.fromARGB(255, 49, 49, 49),
                ),
              ),
            ),
            PlainRectangle(
              top: 80,
              left: 100,
              width: 420,
              height: 250,
              text: appLocalizations.translate('MAIN_LOGOTITLE') ?? '',
              textStyle: const TextStyle(
                fontFamily: 'OpenSans',
                fontSize: 16,
                fontWeight: FontWeight.w400,
                color: Colors.black,
              ),
            ),
            Positioned(
              top: 10,
              left: 140,
              child: Image.asset(
                imagePath,
                width: 360,
                height: 360,
              ),
            ),
            const AdhesiveTape(
              top: 70,
              left: 50,
              angle: -0.8,
            ),
            const AdhesiveTape(
              top: 25,
              left: 435,
              angle: 0.65,
            ),
            const AdhesiveTape(
              top: 295,
              left: 70,
              angle: 0.65,
            ),
            const AdhesiveTape(
              top: 255,
              left: 465,
              angle: -0.8,
            ),
            PlainRectangle(
              top: 430,
              left: 40,
              width: 240,
              height: 190,
              text: (appLocalizations.translate('MAIN_TEAM') ?? '') +
                  " 208: \nJeremy Rouillard,\nLucas Bouchard,\nRyan Lahbabi,\nZarine Amy Ardekani-Djoneidi,\nBadr Amine &\nFatima Zohra Oulaidi ",
              textStyle: TextStyle(
                fontFamily: 'Calibri',
                fontSize: 14,
                fontWeight: FontWeight.w400,
                color: Colors.black,
              ),
            ),
            const AdhesiveTape(
              top: 420,
              left: -10,
              angle: -0.8,
            ),
            const AdhesiveTape(
              top: 395,
              left: 203,
              angle: 0.65,
            ),
            const AdhesiveTape(
              top: 585,
              left: 9,
              angle: 0.65,
            ),
            const AdhesiveTape(
              top: 575,
              left: 225,
              angle: -0.8,
            ),
            Positioned(
              top: 110,
              left: 820,
              child: Image.asset(
                'assets/giant_magnifier.png',
                width: 550,
                height: 550,
              ),
            ),
            PostIt(
              top: 535.0,
              left: 390.0,
              textTop: 65.0,
              textLeft: 30.0,
              color: const Color(0xFFFCDB00),
              buttonText: appLocalizations.translate('MAIN_CLASSIC') ?? '',
              fontSize: 36.0,
              onTap: () {
                GameDataService().gameMode = GameMode.ClassicDeathMatch;
                Navigator.of(context).push(MaterialPageRoute(
                    builder: (context) => const WaitingGameWidget()));
              },
            ),
            PostIt(
              top: 330.0,
              left: 600.0,
              textTop: 30.0,
              textLeft: 10.0,
              color: const Color(0xFFff7faf),
              buttonText: appLocalizations.translate('MAIN_LIMITED') ?? '',
              onTap: () {
                GameDataService().gameMode = GameMode.LimitedTimeDeathMatch;
                Navigator.of(context).push(MaterialPageRoute(
                    builder: (context) => const TimeLimitedWidget()));
              },
              fontSize: 36.0,
            ),
            /*PostIt(
              top: 555.0,
              left: 625.0,
              textTop: 10.0,
              textLeft: 30.0,
              color: const Color(0xFF67EAE5),
              buttonText: 'Administration des jeux',
              onTap: () {
                showDialog(
                  context: context,
                  builder: (BuildContext context) {
                    return CustomDialog();
                  },
                );
              },
              fontSize: 36.0,
            ),*/
            const PushPin(top: 535.0, left: 480),
            const PushPin(top: 330, left: 685),
            //const PushPin(top: 555, left: 710),
          ],
        ),
      ),
    );
  }
}
