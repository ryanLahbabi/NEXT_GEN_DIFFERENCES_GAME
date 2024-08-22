import 'package:flutter/material.dart';
import 'package:flutter_project/dtos/channel-dto.dart';

class ThemeManager with ChangeNotifier {
  final ThemeData _lightTheme = ThemeData.light().copyWith(
    primaryColor: Color(0xFF4d94ff),
    cardColor: const Color.fromARGB(255, 249, 206, 137),
  );

  final ThemeData _darkTheme = ThemeData.light().copyWith(
    primaryColor: Color.fromARGB(255, 51, 46, 121),
    cardColor: const Color.fromARGB(255, 200, 140, 100),
  );

  ThemeData _currentTheme = ThemeData.light();

  ThemeData get currentTheme => _currentTheme;

  void changeTheme(Themes theme) {
    switch (theme) {
      case Themes.dark:
        _currentTheme = _darkTheme;
        break;
      case Themes.light:
      default:
        _currentTheme = _lightTheme;
        break;
    }
    notifyListeners();
  }
}
