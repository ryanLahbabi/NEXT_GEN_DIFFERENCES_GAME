import 'package:flutter/material.dart';

class PaperButtonWidget extends StatelessWidget {
  final String text;
  final double width;
  final double height;
  final double widthPin;
  final VoidCallback onTap;

  const PaperButtonWidget({
    Key? key,
    required this.text,
    required this.width,
    required this.height,
    required this.widthPin,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(children: [
        Container(
          width: width,
          height: height,
          decoration: const BoxDecoration(
            image: DecorationImage(
              image: AssetImage('assets/paper_button.png'),
              fit: BoxFit.cover,
            ),
          ),
        ),
        Positioned(
          top:
              -5, // Ajustez cette valeur si vous voulez déplacer le pin vers le haut/bas
          left: (width - widthPin) / 2, // Centre le pin horizontalement
          child: Container(
            width: widthPin,
            height: height *
                0.5, // Ajustez cette valeur pour changer la taille du pin
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/push_pin.png'),
                fit: BoxFit.contain,
              ),
            ),
          ),
        ),
        // Texte centré sur le bouton
        Positioned(
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          child: Center(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
      ]),
    );
  }
}
