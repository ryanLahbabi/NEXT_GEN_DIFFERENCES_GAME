import 'package:flutter/material.dart';

class ButtonWidget extends StatelessWidget {
  final String text;
  final VoidCallback onClicked;
  final bool isEnabled;

  const ButtonWidget({
    super.key,
    required this.text,
    required this.onClicked,
    this.isEnabled = true,
  });

  @override
  Widget build(BuildContext context) => ElevatedButton(
        style: ElevatedButton.styleFrom(
          shape: const StadiumBorder(),
          backgroundColor: const Color.fromARGB(255, 227, 227, 227),
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
        ),
        onPressed: isEnabled ? onClicked : null,
        child: Text(
          text,
          style: const TextStyle(
            color: Color.fromARGB(255, 0, 0, 0),
          ),
        ),
      );
}
