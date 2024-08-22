import 'dart:convert';

import 'package:flutter/material.dart';

class FlickerOverlay extends StatefulWidget {
  final String base64Image;
  final double width, height;

  const FlickerOverlay({
    Key? key,
    required this.base64Image,
    required this.width,
    required this.height,
  }) : super(key: key);

  @override
  State<FlickerOverlay> createState() => _FlickerOverlayState();
}

class _FlickerOverlayState extends State<FlickerOverlay>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    )..repeat(reverse: true);
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) {
        _controller.stop();
        _controller.dispose();
        setState(
            () {}); // This triggers a rebuild to remove the widget leave it alone
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _controller,
      child: Image.memory(base64Decode(widget.base64Image), fit: BoxFit.cover),
    );
  }

  @override
  void dispose() {
    if (_controller.isAnimating) {
      _controller.stop();
    }
    super.dispose();
  }
}
