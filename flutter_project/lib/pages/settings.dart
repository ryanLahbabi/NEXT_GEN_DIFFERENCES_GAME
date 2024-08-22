import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:flutter_project/classes/applocalization.dart';
import 'package:flutter_project/dtos/channel-dto.dart';
import 'package:flutter_project/pages/main-page.dart';
import 'package:flutter_project/service/settings-service.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({Key? key}) : super(key: key);

  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  AudioPlayer audioPlayer = AudioPlayer();

  final List<Map<String, dynamic>> successSounds = [
    {
      'name': 'DEFAULT_SOUND',
      'sound': './assets/success.mp3',
    },
    {
      'name': 'BINGCHILLING_SOUND',
      'sound': './assets/Bingchilling.mp3',
    },
    {
      'name': 'GOAT_SOUND',
      'sound': './assets/Goat.mp3',
    },
    {
      'name': 'PERFECT_SOUND',
      'sound': './assets/Perfect.mp3',
    },
  ];

  final List<Map<String, dynamic>> failureSounds = [
    {
      'name': 'DEFAULT_SOUND',
      'sound': './assets/error.wav',
    },
    {
      'name': 'BONK_SOUND',
      'sound': './assets/CavemanBonk.mp3',
    },
    {
      'name': 'HUH_SOUND',
      'sound': './assets/Huh.mp3',
    },
    {
      'name': 'BRUH_SOUND',
      'sound': './assets/bruh.mp3',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;
    final ThemeData theme = Theme.of(context);
    return Scaffold(
        body: Stack(
      children: [
        Container(
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
        Center(
          child: Container(
            width: 900,
            decoration: BoxDecoration(
              color: theme.cardColor,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.3),
                  spreadRadius: 5,
                  blurRadius: 7,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(80, 20, 80, 50),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Text(
                          appLocalizations.translate('SETTINGS_TITLE') ?? '',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 30),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Text(
                                '${appLocalizations.translate('THEME') ?? ''}:',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black,
                                ),
                              ),
                              const SizedBox(width: 30),
                              _buildThemeButton(
                                  appLocalizations.translate('THEME_LIGHT') ??
                                      '',
                                  Colors.white,
                                  Colors.black,
                                  'assets/light.png',
                                  Themes.light),
                              const SizedBox(width: 30),
                              _buildThemeButton(
                                  appLocalizations.translate('THEME_DARK') ??
                                      '',
                                  Color(0xff252525),
                                  Colors.white,
                                  'assets/dark.png',
                                  Themes.dark),
                            ],
                          ),
                          Row(
                            children: [
                              Text(
                                '${appLocalizations.translate('LANGUAGE_TITLE') ?? ''}:'
                                '',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black,
                                ),
                              ),
                              const SizedBox(width: 30),
                              _buildLanguageButton(
                                  appLocalizations.translate('FRENCH') ?? '',
                                  Language.fr),
                              const SizedBox(width: 20),
                              _buildLanguageButton(
                                  appLocalizations.translate('ENGLISH') ?? '',
                                  Language.en),
                            ],
                          ),
                        ],
                      ),
                      SizedBox(height: 50),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceAround,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Text(
                                '${appLocalizations.translate('SUCCESS_SOUND') ?? ''}:',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black,
                                ),
                              ),
                              _buildAssetButtons(successSounds, true),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Text(
                                '${appLocalizations.translate('FAILURE_SOUND') ?? ''}:',
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black,
                                ),
                              ),
                              _buildAssetButtons(failureSounds, false),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        Positioned(
          top: 20,
          left: 20,
          child: SafeArea(
            child: IconButton(
              icon: Icon(Icons.arrow_back,
                  color: SettingsService.instance.theme == Themes.dark
                      ? Colors.white
                      : Colors.black),
              onPressed: () {
                Navigator.of(context)
                    .push(MaterialPageRoute(builder: (context) => MainPage()));
              },
              iconSize: 40,
            ),
          ),
        ),
      ],
    ));
  }

  Widget _buildThemeButton(String name, Color backgroundColor, Color textColor,
      String image, Themes value) {
    final isSelected = SettingsService.instance.theme == value;
    return GestureDetector(
      onTap: () => SettingsService.instance.changeTheme(value),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(25),
                color: backgroundColor,
                border: Border.all(
                    strokeAlign: BorderSide.strokeAlignOutside,
                    color: isSelected
                        ? const Color(0xff00a3ff)
                        : Colors.transparent,
                    width: 5)),
            child: Padding(
                padding: EdgeInsets.all(10),
                child: Column(
                  children: [
                    Text(name, style: TextStyle(color: textColor)),
                    const SizedBox(height: 10),
                    Image.asset(image, width: 45, height: 45),
                  ],
                )),
          ),
          if (isSelected)
            Positioned(
                bottom: -8,
                right: -8,
                child:
                    Image.asset('assets/selected.png', width: 30, height: 30)),
        ],
      ),
    );
  }

  Widget _buildLanguageButton(String name, Language value) {
    final isSelected = SettingsService.instance.language == value;
    return GestureDetector(
      onTap: () => SettingsService.instance.changeLanguage(value),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 100,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              color: isSelected
                  ? const Color(0xff84c8ee)
                  : const Color(0xffbfc4c6),
            ),
            child: Padding(
                padding: EdgeInsets.all(12),
                child: Column(
                  children: [
                    Text(name,
                        style: TextStyle(
                            fontWeight: isSelected
                                ? FontWeight.bold
                                : FontWeight.normal)),
                  ],
                )),
          ),
          if (isSelected)
            Positioned(
                bottom: -8,
                right: -8,
                child:
                    Image.asset('assets/selected.png', width: 30, height: 30)),
        ],
      ),
    );
  }

  Widget _buildAssetButtons(List<Map<String, dynamic>> assets, bool isSuccess) {
    final AppLocalizations appLocalizations = AppLocalizations.of(context)!;
    return Column(
      children: assets.map((asset) {
        final String selectedSound = isSuccess
            ? SettingsService.instance.successSoundLongName
            : SettingsService.instance.failureSoundLongName;
        final bool isSelected = selectedSound == asset['sound'];

        return SizedBox(
          width: 300,
          child: ListTile(
            title: Text(appLocalizations.translate(asset['name']) ?? ''),
            trailing: isSelected
                ? Icon(Icons.check_circle)
                : Icon(Icons.circle_outlined),
            onTap: () {
              setState(() {
                if (isSuccess) {
                  SettingsService.instance.changeSuccess(asset['sound']);
                  _playSound(SettingsService.instance.successSound);
                } else {
                  SettingsService.instance.changeFailure(asset['sound']);
                  _playSound(SettingsService.instance.failureSound);
                }
              });
            },
          ),
        );
      }).toList(),
    );
  }

  void _playSound(String soundUri) async {
    audioPlayer.setVolume(0.2);
    await audioPlayer.play(AssetSource('$soundUri'));
  }
}
