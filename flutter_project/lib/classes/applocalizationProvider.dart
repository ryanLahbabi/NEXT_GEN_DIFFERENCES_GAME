import 'package:flutter/material.dart';
import 'package:flutter_project/classes/localization-manager.dart';

class LocalizationProvider extends InheritedWidget {
  final LocalizationManager manager;
  final Widget child;

  LocalizationProvider({
    required this.manager,
    required this.child,
  }) : super(child: child);

  static LocalizationProvider? of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<LocalizationProvider>();
  }

  @override
  bool updateShouldNotify(LocalizationProvider oldWidget) {
    return true;
  }
}
