import 'package:flutter/material.dart';
import 'dart:math' as math;

class CustomArrowWidget extends StatelessWidget {
  final bool activated;
  final VoidCallback buttonClick;

  const CustomArrowWidget({
    Key? key,
    required this.activated,
    required this.buttonClick,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Left arrow with pin
        InkWell(
          onTap: activated ? buttonClick : null,
          child: Stack(
            alignment: Alignment.center,
            children: [ Transform.rotate(
              angle: math.pi, // 180 degrees in radians
              child: Image.asset('assets/green_arrow.png', width: 80),
            ),
              Positioned(
                top: 22, // Adjust these values to position your pin image
                right: 35, // Adjust these values to position your pin image
                child: Image.asset('assets/push_pin.png', width: 15),
              ),
            ],
          ),
        ),
        // Right arrow with pin
        InkWell(
          onTap: activated ? buttonClick : null,
          child: Stack(
            alignment: Alignment.center,
            children: [
              Transform.rotate(
                angle: 0, // 180 degrees in radians
                child: Image.asset('assets/green_arrow.png', width: 80),
              ),
              Positioned(
                bottom: 25, // Adjust these values to position your pin image
                left: 35, // Adjust these values to position your pin image
                  child: Image.asset('assets/push_pin.png', width: 15),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class CarouselWidget extends StatefulWidget {
  final List<Widget> children; // La liste des widgets à afficher dans le carrousel

  CarouselWidget({Key? key, required this.children}) : super(key: key);

  @override
  _CarouselWidgetState createState() => _CarouselWidgetState();
}

class _CarouselWidgetState extends State<CarouselWidget> {
  int currentIndex = 0; // Indice du premier élément visible dans le carrousel

  @override
  Widget build(BuildContext context) {
    // Calculer les indices des éléments à afficher
    int endIndex = currentIndex + 4;
    if (endIndex > widget.children.length) endIndex = widget.children.length;

    List<Widget> visibleChildren = widget.children.sublist(currentIndex, endIndex);

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton(
              icon: Icon(Icons.arrow_left),
              onPressed: () {
                setState(() {
                  currentIndex -= 4;
                  if (currentIndex < 0) currentIndex = 0;
                });
              },
            ),
            Expanded(
              child: GridView.count(
                shrinkWrap: true,
                crossAxisCount: 2,
                childAspectRatio: 2.1,
                crossAxisSpacing: 90,
                mainAxisSpacing: 12,
                children: visibleChildren,
              ),
            ),
            IconButton(
              icon: Icon(Icons.arrow_right),
              onPressed: () {
                setState(() {
                  currentIndex += 4;
                  if (currentIndex >= widget.children.length) currentIndex = widget.children.length - 4;
                });
              },
            ),
          ],
        ),
      ],
    );
  }
}
