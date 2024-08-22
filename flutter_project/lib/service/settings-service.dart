import 'dart:ui';

import 'package:flutter_project/classes/localization-manager.dart';
import 'package:flutter_project/classes/theme-manager.dart';
import 'package:flutter_project/dtos/channel-dto.dart';
import 'package:flutter_project/service/user-service.dart';

class SettingsService {
  static final SettingsService _instance =
      SettingsService._privateConstructor();
  SettingsService._privateConstructor();

  factory SettingsService() {
    return _instance;
  }

  static SettingsService get instance => _instance;

// ----------------------------
  late LocalizationManager _localizationManager;
  late ThemeManager _themeManager;

  late Language _language;
  Themes? _theme;
  late String _successSound;
  late String _failureSound;

  Language get language {
    return _language;
  }

  Themes get theme {
    return _theme ?? Themes.light;
  }

  String get successSound {
    return _extractFileName(_successSound);
  }

  String get failureSound {
    return _extractFileName(_failureSound);
  }

  String get successSoundLongName {
    return _successSound;
  }

  String get failureSoundLongName {
    return _failureSound;
  }

  set language(Language language) {
    _language = language;
    Locale newLocale;
    switch (language) {
      case Language.en:
        newLocale = const Locale('en', 'CA');
        break;
      case Language.fr:
      default:
        newLocale = const Locale('fr', 'CA');
    }
    _localizationManager.changeLanguage(newLocale);
  }

  set theme(Themes theme) {
    _theme = theme;
    _themeManager.changeTheme(theme);
  }

  set successSound(String successSound) {
    _successSound = successSound;
  }

  set failureSound(String failureSound) {
    _failureSound = failureSound;
  }

  void initManagers(
      LocalizationManager localizationManager, ThemeManager themeManager) {
    _localizationManager = localizationManager;
    _themeManager = themeManager;
  }

  Future<void> initData() async {
    Map<String, dynamic> userData =
        await UserDataService.instance.fetchUserData();
    language = _languageFromString(userData['interfacePreference']['language']);
    theme = _themeFromString(userData['interfacePreference']['theme']);
    successSound = userData['success'];
    failureSound = userData['failure'];
  }

  void changeTheme(Themes newTheme) {
    theme = newTheme;
    UserDataService.instance.putTheme(newTheme);
  }

  void changeLanguage(Language newLanguage) {
    language = newLanguage;
    UserDataService.instance.putLanguage(newLanguage);
  }

  void changeSuccess(String newSuccessSound) {
    successSound = newSuccessSound;
    UserDataService.instance.putSuccess(newSuccessSound);
  }

  void changeFailure(String newFailureSound) {
    failureSound = newFailureSound;
    UserDataService.instance.putFailure(newFailureSound);
  }

  Language _languageFromString(String languageStr) {
    if (languageStr == 'en') {
      return Language.en;
    } else {
      return Language.fr;
    }
  }

  Themes _themeFromString(String themeStr) {
    if (themeStr == 'dark') {
      return Themes.dark;
    } else {
      return Themes.light;
    }
  }

  String _extractFileName(String? path) {
    if (path == null) return '';
    List<String> pathSegments = path.split('/');
    return pathSegments.last;
  }
}
