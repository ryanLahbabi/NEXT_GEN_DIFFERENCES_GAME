import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_project/classes/applocalization.dart';
import 'package:flutter_project/classes/applocalizationProvider.dart';
import 'package:flutter_project/classes/localization-manager.dart';
import 'package:flutter_project/classes/theme-manager.dart';
import 'package:flutter_project/pages/reset-password-page.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:flutter_project/service/noftification-service.dart';
import 'package:flutter_project/service/observer-service.dart';
import 'package:flutter_project/service/settings-service.dart';
import 'package:flutter_project/widget/imageCarousel.dart';
import 'package:flutter_project/widget/profile/avatar-widget.dart';
import 'package:flutter_project/widget/profile/take_picture_screen.dart';
import 'package:provider/provider.dart';

import '../dtos/channel-dto.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);
  await NotificationService().init();

  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  Locale _locale = const Locale('fr'); // Default locale
  late LocalizationManager _localizationManager;

  @override
  void initState() {
    super.initState();
    _localizationManager = LocalizationManager();
    _localizationManager
        .changeLanguage(const Locale('fr')); // Set default locale
  }

  void _changeLanguage(Locale locale) {
    print("i am changing the language");
    setState(() {
      _locale = locale;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
            create: (_) => ThemeManager()), // Initialize ThemeManager
        ChangeNotifierProvider(
            create: (_) =>
                LocalizationManager()), // Initialize LocalizationManager
        ChangeNotifierProvider(
            create: (_) => ObserverService()), // Initialize ObserverService
      ],
      child: Consumer2<ThemeManager, LocalizationManager>(
        builder: (context, themeManager, localizationManager, _) {
          SettingsService().initManagers(localizationManager, themeManager);
          return MaterialApp(
            title: 'Jeu des différences',
            home: AuthScreen(),
            locale: localizationManager.currentLocale,
            supportedLocales: const [
              Locale('en', ''),
              Locale('fr', ''),
            ],
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
            ],
            builder: (context, child) {
              return Builder(
                builder: (context) {
                  return Theme(
                    data: themeManager.currentTheme,
                    child: LocalizationProvider(
                      manager: localizationManager,
                      child: child!,
                    ),
                  );
                },
              );
            },
          );
        },
      ),
    );
  }
}

class AuthScreen extends StatefulWidget {
  @override
  _AuthScreenState createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _isPasswordVisible = false;
  bool creatingAccount = false;
  final FocusNode _passwordFocusNode = FocusNode();
  final FocusNode _usernameFocusNode = FocusNode();
  final FocusNode _emailFocusNode = FocusNode();

  final TextEditingController usernameController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

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
  String avatar = "avatar_placeholder";
  CameraDescription? camera;

  Future<void> getCamera() async {
    final cameras = await availableCameras();
    if (cameras.isNotEmpty) {
      camera = cameras.first;
    }
  }

  void updateImagePath(String imagePath, VoidCallback closeWidget) {
    setState(() {
      avatar = imagePath;
    });
    closeWidget();
  }

  void _signUp(BuildContext context) async {
    try {
      await AuthService.instance.signUp(
        context,
        usernameController.text,
        passwordController.text,
        emailController.text,
        avatar,
      );
      await AuthService.instance
          .saveUsernameToLocalStorage(usernameController.text);
      AuthService.instance.username = usernameController.text;
      //widget.authService.saveUsername(usernameController.text);
    } catch (e) {
      print('Sign-up failed: $e');
    }
  }

  void _signIn(BuildContext context) async {
    try {
      await AuthService.instance.signIn(
        context,
        usernameController.text,
        passwordController.text,
      );
      await AuthService.instance
          .saveUsernameToLocalStorage(usernameController.text);
      AuthService.instance.username = usernameController.text;
      //widget.authService.saveUsername(usernameController.text);
    } catch (e) {
      print('Sign-in failed: $e');
    }
  }

  @override
  void initState() {
    super.initState();
    getCamera();
    _passwordFocusNode.addListener(() {
      if (_passwordFocusNode.hasFocus) {
        _passwordFocusNode.onKeyEvent = (node, event) {
          if (event is KeyDownEvent) {
            if (event.logicalKey == LogicalKeyboardKey.enter) {
              _attemptSignInOrSignUp();
              return KeyEventResult.handled;
            }
          }
          return KeyEventResult.ignored;
        };
      } else {
        _passwordFocusNode.onKeyEvent = null;
      }
    });

    _usernameFocusNode.addListener(() {
      if (_usernameFocusNode.hasFocus) {
        _usernameFocusNode.onKeyEvent = (node, event) {
          if (event is KeyDownEvent) {
            if (event.logicalKey == LogicalKeyboardKey.enter) {
              _attemptSignInOrSignUp();
              return KeyEventResult.handled;
            }
          }
          return KeyEventResult.ignored;
        };
      } else {
        _usernameFocusNode.onKeyEvent = null;
      }
    });

    _emailFocusNode.addListener(() {
      if (_emailFocusNode.hasFocus) {
        _emailFocusNode.onKeyEvent = (node, event) {
          if (event is KeyDownEvent) {
            if (event.logicalKey == LogicalKeyboardKey.enter) {
              _attemptSignInOrSignUp();
              return KeyEventResult.handled;
            }
          }
          return KeyEventResult.ignored;
        };
      } else {
        _emailFocusNode.onKeyEvent = null;
      }
    });
  }

  void _attemptSignInOrSignUp() {
    FocusScope.of(context).unfocus();
    if (_formKey.currentState?.validate() ?? false) {
      creatingAccount ? _signUp(context) : _signIn(context);
    }
  }

  @override
  void dispose() {
    _passwordFocusNode.dispose();
    _usernameFocusNode.dispose();
    _emailFocusNode.dispose();
    usernameController.dispose();
    passwordController.dispose();
    emailController.dispose();
    super.dispose();
  }

  Widget _gap() => const SizedBox(height: 13);

  @override
  Widget build(BuildContext context) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;
    return Scaffold(
      resizeToAvoidBottomInset: true,
      body: GestureDetector(
        onTap: () => FocusScope.of(context)
            .unfocus(), // Dismiss keyboard when tapping outside
        child: Container(
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
          child: Form(
            key: _formKey,
            child: Center(
              child: SingleChildScrollView(
                child: Padding(
                  padding: EdgeInsets.only(
                      bottom: MediaQuery.of(context).viewInsets.bottom),
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final double cardWidth = constraints.maxWidth > 350
                          ? 630.0
                          : constraints.maxWidth * 0.9;
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
                              padding: const EdgeInsets.all(28.0),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Transform.translate(
                                    offset: const Offset(10, 45),
                                    child: const Text(
                                      "Bienvenue à PolyDiff !",
                                      style: TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 29,
                                        color: Colors.black,
                                      ),
                                    ),
                                  ),
                                  Transform.translate(
                                    offset: const Offset(10, -43),
                                    child: Transform.rotate(
                                      angle: 0.65,
                                      child: Image.asset(
                                        'assets/push_pin.png',
                                        width: 33,
                                        height: 33,
                                      ),
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.only(top: 8.0),
                                    child: Text(
                                      "",
                                      style:
                                          Theme.of(context).textTheme.caption,
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                  _gap(),
                                  if (creatingAccount)
                                    TextFormField(
                                      focusNode: _emailFocusNode,
                                      controller: emailController,
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return 'Entrez un courriel';
                                        }
                                        bool emailValid = RegExp(
                                                r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+")
                                            .hasMatch(value);
                                        if (!emailValid) {
                                          return 'Entrez un courriel valide';
                                        }
                                        return null;
                                      },
                                      decoration: const InputDecoration(
                                        labelText: 'Courriel',
                                        hintText: 'Entrez votre courriel',
                                        prefixIcon: Icon(Icons.email_outlined),
                                        border: OutlineInputBorder(),
                                      ),
                                    ),
                                  _gap(),
                                  TextFormField(
                                    focusNode: _usernameFocusNode,
                                    controller: usernameController,
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return 'Entrez un pseudonyme';
                                      }
                                      if (creatingAccount && value.length < 3) {
                                        return 'Votre pseudonyme doit avoir au moins 3 caractères';
                                      }
                                      return null;
                                    },
                                    decoration: const InputDecoration(
                                      labelText: 'Pseudonyme',
                                      hintText: 'Entrez votre pseudonyme',
                                      prefixIcon: Icon(Icons.person),
                                      border: OutlineInputBorder(),
                                    ),
                                  ),
                                  _gap(),
                                  TextFormField(
                                    focusNode: _passwordFocusNode,
                                    controller: passwordController,
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return 'Entrez un mot de passe';
                                      }
                                      if (creatingAccount && value.length < 8) {
                                        return 'Votre mot de passe doit avoir au moins 8 caractères';
                                      }
                                      return null;
                                    },
                                    obscureText: !_isPasswordVisible,
                                    decoration: InputDecoration(
                                      labelText: 'Mot de passe',
                                      hintText: 'Entrez votre mot de passe',
                                      prefixIcon: const Icon(
                                          Icons.lock_outline_rounded),
                                      border: const OutlineInputBorder(),
                                      suffixIcon: IconButton(
                                        icon: Icon(
                                          _isPasswordVisible
                                              ? Icons.visibility_off
                                              : Icons.visibility,
                                        ),
                                        onPressed: () {
                                          setState(() {
                                            _isPasswordVisible =
                                                !_isPasswordVisible;
                                          });
                                        },
                                      ),
                                    ),
                                  ),
                                  if (creatingAccount) _gap(),
                                  if (creatingAccount)
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Column(
                                          children: [
                                            Text('Avatar:',
                                                style: TextStyle(fontSize: 16)),
                                            AvatarWidget(
                                              imagePath: avatar,
                                              size: 100,
                                            ),
                                          ],
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
                                                            color: Colors.white,
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
                                                          Radius.circular(100)),
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
                                                      child: TakePictureScreen(
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
                                                          Radius.circular(100)),
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
                                                  avatar = 'avatar_placeholder';
                                                });
                                              },
                                              child: Container(
                                                padding:
                                                    const EdgeInsets.all(10),
                                                decoration: BoxDecoration(
                                                  borderRadius:
                                                      const BorderRadius.all(
                                                          Radius.circular(100)),
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
                                  _gap(),
                                  SizedBox(
                                    width: double.infinity,
                                    child: ElevatedButton(
                                      style: ElevatedButton.styleFrom(
                                        shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(4)),
                                      ),
                                      child: const Padding(
                                        padding: EdgeInsets.all(10.0),
                                        child: Text(
                                          'Connexion',
                                          style: TextStyle(
                                              color: Colors.black,
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      onPressed: () {
                                        FocusScope.of(context).unfocus();
                                        if (_formKey.currentState?.validate() ??
                                            false) {
                                          creatingAccount
                                              ? _signUp(context)
                                              : _signIn(context);
                                        }
                                      },
                                    ),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.only(
                                        left: 0, top: 8.0),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        TextButton(
                                          onPressed: () {
                                            setState(() {
                                              creatingAccount =
                                                  !creatingAccount;
                                            });
                                          },
                                          child: Text(
                                            creatingAccount
                                                ? "Déjà un compte ? Connectez-vous"
                                                : "Pas de compte ? Créez-en un",
                                            style: Theme.of(context)
                                                .textTheme
                                                .caption,
                                            textAlign: TextAlign.right,
                                          ),
                                        ),
                                        if (!creatingAccount)
                                          TextButton(
                                            onPressed: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                    builder: (context) =>
                                                        ResetPasswordScreen()),
                                              );
                                            },
                                            child: Text(
                                              appLocalizations.translate(
                                                      'LOGIN_RESETPASSWORD') ??
                                                  '',
                                              style: Theme.of(context)
                                                  .textTheme
                                                  .bodySmall,
                                              textAlign: TextAlign.right,
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
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
          ),
        ),
      ),
    );
  }
}
