import 'package:flutter/material.dart';

class LocalizationManager extends ChangeNotifier {
  Locale _currentLocale = Locale('fr', 'CA');

  Locale get currentLocale => _currentLocale;

  void changeLanguage(Locale newLocale) {
    _currentLocale = newLocale;
    notifyListeners(); // Notify listeners to update the UI
  }
}
