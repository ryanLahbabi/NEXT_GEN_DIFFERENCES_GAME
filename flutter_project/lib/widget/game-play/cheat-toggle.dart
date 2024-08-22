import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_project/dtos/channel-dto.dart';
import 'package:flutter_project/service/game-data-service.dart';
import 'package:flutter_project/service/settings-service.dart';

class VisibilityToggleIcon extends StatefulWidget {
  final Function(bool isVisible) onToggle;

  const VisibilityToggleIcon({Key? key, required this.onToggle})
      : super(key: key);

  @override
  _VisibilityToggleIconState createState() => _VisibilityToggleIconState();
}

class _VisibilityToggleIconState extends State<VisibilityToggleIcon> {
  @override
  Widget build(BuildContext context) {
    bool _isVisible = GameDataService().showCheat;

    return GestureDetector(
      onTap: () {
        setState(() {
          GameDataService().showCheat = !GameDataService().showCheat;
          widget.onToggle(GameDataService().showCheat);
        });
      },
      child: Icon(
        _isVisible ? Icons.visibility_off : Icons.visibility,
        size: 40,
        color: SettingsService.instance.theme == Themes.dark
            ? Colors.white
            : Color.fromARGB(255, 49, 49, 49),
      ),
    );
  }
}

class FlickerSequenceOverlay extends StatefulWidget {
  final List<String> base64Images;
  final double width, height;

  const FlickerSequenceOverlay({
    Key? key,
    required this.base64Images,
    required this.width,
    required this.height,
  }) : super(key: key);

  @override
  _FlickerSequenceOverlayState createState() => _FlickerSequenceOverlayState();
}

class _FlickerSequenceOverlayState extends State<FlickerSequenceOverlay>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: widget.base64Images
          .asMap()
          .entries
          .where((entry) => entry.value != null)
          .map((entry) {
        int index = entry.key;
        String? base64Image = entry.value;

        if (base64Image == null) {
          return Container();
        }

        return GestureDetector(
          onTapDown: (TapDownDetails details) {},
          child: FadeTransition(
            opacity: _controller,
            child: Image.memory(
              base64Decode(base64Image),
              width: widget.width,
              height: widget.height,
              fit: BoxFit.cover,
            ),
          ),
        );
      }).toList(),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
