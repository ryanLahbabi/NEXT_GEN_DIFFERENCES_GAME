import 'package:flutter/material.dart';

class ErrorMarker extends StatelessWidget {
  final double posX;
  final double posY;

  const ErrorMarker({Key? key, required this.posX, required this.posY})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: posX - 5,
      top: posY - 15,
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.transparent,
          shape: BoxShape.circle,
        ),
        child: const Text(
          'X',
          style: TextStyle(
            color: Colors.red,
            fontWeight: FontWeight.bold,
            fontSize: 30,
          ),
        ),
      ),
    );
  }
}

class ErrorMarkerData {
  final double posX;
  final double posY;
  bool isVisible;

  ErrorMarkerData(
      {required this.posX, required this.posY, this.isVisible = true});
}
