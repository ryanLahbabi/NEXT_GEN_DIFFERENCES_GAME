import 'package:flutter/material.dart';
import 'package:flutter_project/classes/user.dart';
import 'package:flutter_project/pages/edit-profile-page.dart';
import 'package:flutter_project/pages/login-page.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:flutter_project/service/message-service.dart';
import 'package:flutter_project/service/user-service.dart';
import 'package:flutter_project/widget/message-widget.dart';
import 'package:flutter_project/widget/profile/avatar-widget.dart';
import 'package:flutter_project/widget/profile/button-widget.dart';
import 'package:flutter_project/widget/statisticTab.dart';

import '../classes/applocalization.dart';
import '../dtos/channel-dto.dart';
import '../service/settings-service.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({Key? key}) : super(key: key);

  @override
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  late String biography = '';
  late String avatar = '';
  late int elo;
  late dynamic generalGameStatistics;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late String theme = '';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    getUserData();
  }

  Future<void> getUserData() async {
    try {
      final userData = await UserDataService.instance.fetchUserData();
      setState(() {
        biography = userData['biography'];
        avatar = userData['avatar'];
        elo = userData['elo'];
        generalGameStatistics = userData['generalGameStatistics'];
        _isLoading = false;
      });
    } catch (e) {
      print('Error fetching user data: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    final user = UserPreferences.myUser;

    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    return Scaffold(
      key: _scaffoldKey,
      drawer: const MessageWidget(),
      resizeToAvoidBottomInset: false,
      body: Container(
        decoration: BoxDecoration(
          image: DecorationImage(
            image: AssetImage(
              SettingsService.instance.theme == Themes.dark
                  ? 'assets/dark_background.png'
                  : 'assets/Postboard_background.png',
            ),
            fit: BoxFit.cover,
          ),
        ),
        child: Stack(children: [
          Center(
            child: SingleChildScrollView(
              child: Padding(
                padding: EdgeInsets.only(
                    bottom: MediaQuery.of(context).viewInsets.bottom),
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final double cardWidth = constraints.maxWidth * 0.9;
                    return Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Card(
                          elevation: 8,
                          child: Container(
                            width: cardWidth,
                            decoration: BoxDecoration(
                              color: const Color(0xFFabbeff),
                              borderRadius: BorderRadius.circular(0.0),
                            ),
                            padding: const EdgeInsets.fromLTRB(50, 30, 50, 30),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      flex: 1,
                                      child: Row(
                                        children: [
                                          const SizedBox(width: 30),
                                          AvatarWidget(
                                            imagePath: avatar,
                                            size: 130,
                                          ),
                                          const SizedBox(width: 30),
                                          Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                AuthService.instance.username,
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.w700,
                                                  fontSize: 26,
                                                  color: Colors.black,
                                                ),
                                              ),
                                              const SizedBox(height: 10),
                                              Text(
                                                (appLocalizations
                                                            .translate('ELO') ??
                                                        "") +
                                                    ": ${elo}",
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.w700,
                                                  fontSize: 18,
                                                  color: Colors.black,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          appLocalizations
                                                  .translate('BIOGRAPHY') ??
                                              '',
                                          style: TextStyle(
                                              fontSize: 20,
                                              fontWeight: FontWeight.bold),
                                        ),
                                        SizedBox(height: 5),
                                        Container(
                                          width: 600,
                                          height: 120,
                                          decoration: const BoxDecoration(
                                              color: Colors.white,
                                              borderRadius: BorderRadius.all(
                                                  Radius.circular(10))),
                                          padding: const EdgeInsets.all(20),
                                          child: SingleChildScrollView(
                                            scrollDirection: Axis.vertical,
                                            child: Text(
                                              biography,
                                              style: const TextStyle(
                                                  fontSize: 16, height: 1.4),
                                            ),
                                          ),
                                        ),
                                      ],
                                    )
                                  ],
                                ),
                                const SizedBox(height: 30),
                                Container(
                                  width: constraints.maxWidth * 0.8,
                                  child: StatisticTabWidget(
                                      generalGameStatistics:
                                          generalGameStatistics),
                                ),
                                const SizedBox(height: 30),
                                ButtonWidget(
                                  text: appLocalizations
                                          .translate('EDIT_PROFILE') ??
                                      '',
                                  onClicked: () async {
                                    // Navigate to the edit profile page and wait for the result
                                    final updatedData =
                                        await Navigator.of(context)
                                            .push<Map<String, dynamic>>(
                                      MaterialPageRoute(
                                          builder: (context) => EditProfilePage(
                                                avatar: avatar,
                                                biography: biography,
                                              )),
                                    );
                                    if (updatedData != null) {
                                      setState(() {
                                        if (updatedData.containsKey('avatar')) {
                                          avatar =
                                              updatedData['avatar'] ?? avatar;
                                        }
                                        if (updatedData
                                            .containsKey('biography')) {
                                          biography =
                                              updatedData['biography'] ??
                                                  biography;
                                        }
                                      });
                                    }
                                  },
                                )
                              ],
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ),
          ),
          Positioned(
            top: 20,
            left: 20,
            child: SafeArea(
              child: IconButton(
                icon: Icon(
                  Icons.arrow_back,
                  color: SettingsService.instance.theme == Themes.dark
                      ? Colors.white
                      : Color.fromARGB(255, 49, 49, 49),
                ),
                onPressed: () => Navigator.of(context).pop(),
                iconSize: 40,
              ),
            ),
          ),
          Positioned(
            top: 34,
            right: 100,
            child: Builder(
              builder: (BuildContext context) {
                return GestureDetector(
                  onTap: () {
                    _scaffoldKey.currentState?.openDrawer();
                    MessageService.instance.markMessageAsRead();
                  },
                  child: Stack(
                    children: <Widget>[
                      Icon(
                        Icons.message_outlined,
                        size: 40,
                        color: SettingsService.instance.theme == Themes.dark
                            ? Colors.white
                            : Color.fromARGB(255, 49, 49, 49),
                      ),
                      Positioned(
                        top: 0,
                        right: 0,
                        child: ValueListenableBuilder<bool>(
                          valueListenable:
                              MessageService.instance.hasUnreadMessage,
                          builder: (context, hasUnread, child) {
                            return hasUnread
                                ? Container(
                                    width: 18,
                                    height: 18,
                                    decoration: BoxDecoration(
                                      color: Colors.red,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                          color: Colors.white, width: 1),
                                    ),
                                  )
                                : Container();
                          },
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          Positioned(
            top: 30,
            right: 30,
            child: GestureDetector(
              onTap: () {
                showDialog(
                  context: context,
                  builder: (BuildContext context) {
                    return AlertDialog(
                      title: Text('Déconnexion'),
                      content: Text('Voulez-vous vraiment vous déconnecter ?'),
                      actions: <Widget>[
                        TextButton(
                          child: Text('Annuler'),
                          onPressed: () {
                            Navigator.of(context).pop();
                          },
                        ),
                        TextButton(
                          child: Text('Déconnexion'),
                          onPressed: () async {
                            Navigator.of(context).pop();
                            MessageService.instance.logout();
                            await AuthService.instance
                                .logout()
                                .then((value) => {
                                      Navigator.pushReplacement(
                                          context,
                                          MaterialPageRoute(
                                              builder: (context) => MyApp()))
                                    });
                          },
                        ),
                      ],
                    );
                  },
                );
              },
              child: Icon(
                Icons.logout,
                size: 40,
                color: SettingsService.instance.theme == Themes.dark
                    ? Colors.white
                    : Color.fromARGB(255, 49, 49, 49),
              ),
            ),
          ),
        ]),
      ),
    );
  }
}