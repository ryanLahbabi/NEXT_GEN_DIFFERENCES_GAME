import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:flutter_project/service/message-service.dart';
import 'package:flutter_project/service/user-service.dart';
import 'package:flutter_project/widget/imageCarousel.dart';
import 'package:flutter_project/widget/message-widget.dart';
import 'package:flutter_project/widget/profile/avatar-widget.dart';
import 'package:flutter_project/widget/profile/button-widget.dart';
import 'package:flutter_project/widget/profile/take_picture_screen.dart';

import '../classes/applocalization.dart';
import '../dtos/channel-dto.dart';
import '../service/settings-service.dart';

class EditProfilePage extends StatefulWidget {
  String biography;
  String avatar;
  String username = AuthService.instance.username;
  EditProfilePage({super.key, required this.biography, required this.avatar});

  @override
  _EditProfilePageState createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  CameraDescription? camera;

  List<String> carouselImages = [
    './assets/avatar1.png',
    './assets/avatar2.png',
    './assets/avatar3.png',
    './assets/avatar4.png',
    './assets/avatar5.png',
    './assets/avatar6.png',
    './assets/avatar7.png',
    './assets/avatar8.png',
  ];

  void updateImagePath(String imagePath, VoidCallback closeWidget) {
    setState(() {
      widget.avatar = imagePath;
    });
    closeWidget();
  }

  @override
  void initState() {
    super.initState();
    getCamera();
  }

  bool isValidUsername() {
    return widget.username.length >= 3;
  }

  Future<void> getCamera() async {
    final cameras = await availableCameras();
    if (cameras.isNotEmpty) {
      camera = cameras.first;
    }
  }

  Future<String?> tryChangingUsername() async {
    if (widget.username == AuthService.instance.username) {
      return null;
    } else {
      final (newUsername, newToken) =
          await UserDataService.instance.postUsername(widget.username);
      AuthService.instance.username = newUsername;
      AuthService.instance.saveUsernameToLocalStorage(newUsername);
      return newToken;
    }
  }

  void showSnackBar(BuildContext context, String message) {
    final snackBar = SnackBar(
      content: Text(message),
      duration: const Duration(seconds: 5),
      backgroundColor: Colors.red,
      dismissDirection: DismissDirection.up,
      behavior: SnackBarBehavior.floating,
      margin: EdgeInsets.only(bottom: MediaQuery.of(context).size.height - 73),
    );
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }

  @override
  Widget build(BuildContext context) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;

    return Scaffold(
      key: _scaffoldKey,
      resizeToAvoidBottomInset: true,
      drawer: const MessageWidget(),
      body: SingleChildScrollView(
        child: Padding(
          padding:
              EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
          child: Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: MediaQuery.of(context).size.width,
                height: MediaQuery.of(context).size.height,
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
              ),
              Positioned(
                top: 35,
                right: 30,
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
              Center(
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final double cardWidth = constraints.maxWidth * 0.65;
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
                              children: [
                                Container(
                                  width: constraints.maxWidth * 0.5,
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                              appLocalizations
                                                      .translate('PSEUDO') ??
                                                  '',
                                              style: TextStyle(
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.bold)),
                                          const SizedBox(height: 10),
                                          Stack(
                                            clipBehavior: Clip.none,
                                            children: [
                                              Container(
                                                width: 275,
                                                height: 40,
                                                child: TextFormField(
                                                  onChanged: (value) => {
                                                    setState(() {
                                                      widget.username = value;
                                                    })
                                                  },
                                                  initialValue: widget.username,
                                                  decoration: InputDecoration(
                                                    contentPadding:
                                                        const EdgeInsets
                                                            .symmetric(
                                                            horizontal: 10),
                                                    filled: true,
                                                    fillColor: isValidUsername()
                                                        ? Colors.white
                                                        : Colors.red[100],
                                                    border:
                                                        const OutlineInputBorder(),
                                                  ),
                                                ),
                                              ),
                                              Visibility(
                                                visible: !isValidUsername(),
                                                child: Positioned(
                                                  bottom: -20,
                                                  child: Text(
                                                    appLocalizations.translate(
                                                            'SIGNUP_USERERROR') ??
                                                        '',
                                                    style: TextStyle(
                                                        color: Colors.redAccent
                                                            .shade700),
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ),
                                      Row(
                                        children: [
                                          AvatarWidget(
                                            imagePath: widget.avatar,
                                            size: 140,
                                          ),
                                          const SizedBox(width: 10),
                                          Column(
                                            children: [
                                              GestureDetector(
                                                onTap: () {
                                                  showDialog(
                                                    context: context,
                                                    builder: (context) {
                                                      return Dialog(
                                                        elevation: 0,
                                                        child: Column(
                                                          mainAxisSize:
                                                              MainAxisSize.min,
                                                          children: [
                                                            Container(
                                                              width: 600,
                                                              height: 300,
                                                              color:
                                                                  Colors.white,
                                                              child: Column(
                                                                mainAxisAlignment:
                                                                    MainAxisAlignment
                                                                        .center,
                                                                children: [
                                                                  Expanded(
                                                                    child:
                                                                        ImageCarousel(
                                                                      carouselImages:
                                                                          carouselImages,
                                                                      onImageSelected:
                                                                          (imagePath,
                                                                              closeWidget) {
                                                                        updateImagePath(
                                                                            imagePath,
                                                                            closeWidget); // Call updateImagePath function
                                                                      },
                                                                    ),
                                                                  ),
                                                                ],
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      );
                                                    },
                                                  );
                                                },
                                                child: Container(
                                                  padding:
                                                      const EdgeInsets.all(10),
                                                  decoration: BoxDecoration(
                                                    borderRadius:
                                                        const BorderRadius.all(
                                                            Radius.circular(
                                                                100)),
                                                    border: Border.all(
                                                        color: Colors.white),
                                                    color: Colors.indigo,
                                                  ),
                                                  child: const Icon(
                                                    Icons.edit,
                                                    color: Colors.white,
                                                    size: 24.0,
                                                  ),
                                                ),
                                              ),
                                              GestureDetector(
                                                onTap: () {
                                                  showDialog(
                                                    context: context,
                                                    builder: (context) {
                                                      return Dialog(
                                                        elevation: 0,
                                                        child:
                                                            TakePictureScreen(
                                                                onPictureTaken:
                                                                    (imagePath,
                                                                        closeWidget) {
                                                                  updateImagePath(
                                                                      imagePath,
                                                                      closeWidget);
                                                                },
                                                                camera: camera),
                                                      );
                                                    },
                                                  );
                                                },
                                                child: Container(
                                                  padding:
                                                      const EdgeInsets.all(10),
                                                  decoration: BoxDecoration(
                                                    borderRadius:
                                                        const BorderRadius.all(
                                                            Radius.circular(
                                                                100)),
                                                    border: Border.all(
                                                        color: Colors.white),
                                                    color: Colors.indigo,
                                                  ),
                                                  child: const Icon(
                                                    Icons.photo_camera,
                                                    color: Colors.white,
                                                    size: 24.0,
                                                  ),
                                                ),
                                              ),
                                              GestureDetector(
                                                onTap: () {
                                                  setState(() {
                                                    widget.avatar =
                                                        'avatar_placeholder';
                                                  });
                                                },
                                                child: Container(
                                                  padding:
                                                      const EdgeInsets.all(10),
                                                  decoration: BoxDecoration(
                                                    borderRadius:
                                                        const BorderRadius.all(
                                                            Radius.circular(
                                                                100)),
                                                    border: Border.all(
                                                        color: Colors.white),
                                                    color: Colors.indigo,
                                                  ),
                                                  child: const Icon(
                                                    Icons.close,
                                                    color: Colors.white,
                                                    size: 24.0,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                          const SizedBox(width: 30),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 30),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          appLocalizations
                                                  .translate('BIOGRAPHY') ??
                                              '',
                                          style: TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold),
                                        ),
                                        const SizedBox(height: 5),
                                        Container(
                                          width: constraints.maxWidth * 0.5,
                                          child: TextFormField(
                                            inputFormatters: [
                                              LengthLimitingTextInputFormatter(
                                                  500),
                                            ],
                                            initialValue: widget.biography,
                                            keyboardType:
                                                TextInputType.multiline,
                                            maxLines: 4,
                                            onChanged: (about) {
                                              widget.biography = about;
                                            },
                                            decoration: InputDecoration(
                                              filled: true,
                                              fillColor: Colors.white,
                                              border: OutlineInputBorder(),
                                              hintText:
                                                  appLocalizations.translate(
                                                          'TALK_ABOUT_YOU') ??
                                                      '',
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 30),
                                ButtonWidget(
                                    isEnabled: isValidUsername(),
                                    text: appLocalizations
                                            .translate('SAVE_PROFILE') ??
                                        '',
                                    onClicked: () {
                                      tryChangingUsername()
                                          .then((newToken) async {
                                        if (newToken != null) {
                                          await AuthService.instance
                                              .saveTokenToLocalStorage(
                                                  newToken);
                                          AuthService.instance.token = newToken;
                                        }
                                        await UserDataService.instance
                                            .saveBiography(widget.biography)
                                            .catchError((error) {
                                          print(
                                              'Error saving biography: $error');
                                        });
                                        await UserDataService.instance
                                            .saveAvatar(widget.avatar)
                                            .catchError((error) {
                                          print('Error saving avatar: $error');
                                        });
                                        await AuthService.instance
                                            .reconnectSocket();
                                        Navigator.of(context).pop({
                                          'biography': widget.biography,
                                          'avatar': widget.avatar
                                        });
                                      }).catchError((e) {
                                        if (e
                                            .toString()
                                            .contains('USERNAME_IN_USE')) {
                                          showSnackBar(
                                              context,
                                              appLocalizations.translate(
                                                      'ERROR_USERNAME_NOT_UNIQUE') ??
                                                  '');
                                        } else {
                                          showSnackBar(
                                              context,
                                              appLocalizations.translate(
                                                      'ERROR_USERNAME') ??
                                                  '');
                                        }
                                      });
                                    }),
                              ],
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
