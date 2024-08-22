import 'package:flutter/material.dart';

class PostIt extends StatelessWidget {
  final double top;
  final double left;
  final double textTop;
  final double textLeft;
  final Color color;
  final String buttonText;
  final VoidCallback onTap;
  final double fontSize;

  const PostIt({
    Key? key,
    required this.top,
    required this.left,
    required this.textTop,
    required this.textLeft,
    required this.color,
    required this.buttonText,
    required this.onTap,
    this.fontSize = 20.0,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: top,
      left: left,
      child: Transform.rotate(
        angle: -0.10,
        child: GestureDetector(
          onTap: onTap,
          child: Container(
            width: 220.0,
            height: 185.0,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(0.0),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.8),
                  offset: const Offset(4, 4),
                  blurRadius: 5.0,
                ),
              ],
            ),
            child: Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  buttonText,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: 'ReenieBeanie',
                    fontWeight: FontWeight.w700,
                    fontSize: fontSize,
                    color: Colors.black,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class PushPin extends StatelessWidget {
  final double top;
  final double left;

  const PushPin({Key? key, required this.top, required this.left})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: top,
      left: left,
      child: Image.asset(
        'assets/push_pin.png',
        fit: BoxFit.cover,
        width: 40,
        height: 40,
      ),
    );
  }
}

class AskFriend extends StatelessWidget {
  final double top;
  final double left;
  final double angle;

  const AskFriend({
    Key? key,
    required this.top,
    required this.left,
    required this.angle,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: top,
      left: left,
      child: Transform.rotate(
        angle: angle,
        child: Image.asset(
          'assets/ask_friend.jpg',
          fit: BoxFit.cover,
          width: 120,
          height: 45,
        ),
      ),
    );
  }
}

class searchFriends extends StatelessWidget {
  final double top;
  final double left;
  final double angle;

  const searchFriends({
    Key? key,
    required this.top,
    required this.left,
    required this.angle,
  });

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: top,
      left: left,
      child: Transform.rotate(
        angle: angle,
        child: Image.asset(
          'assets/search_friend.png',
          fit: BoxFit.cover,
          width: 120,
          height: 45,
        ),
      ),
    );
  }
}

class AdhesiveTape extends StatelessWidget {
  final double top;
  final double left;
  final double angle;

  const AdhesiveTape({
    Key? key,
    required this.top,
    required this.left,
    required this.angle,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: top,
      left: left,
      child: Transform.rotate(
        angle: angle,
        child: Image.asset(
          'assets/adhesive_tape.png',
          fit: BoxFit.cover,
          width: 120,
          height: 45,
        ),
      ),
    );
  }
}

class PlainRectangle extends StatelessWidget {
  final double top;
  final double left;
  final double width;
  final double height;
  final String text;
  final TextStyle textStyle;
  final TextAlign textAlign;

  const PlainRectangle({
    Key? key,
    required this.top,
    required this.left,
    required this.width,
    required this.height,
    required this.text,
    required this.textStyle,
    this.textAlign = TextAlign.center,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          top: top,
          left: left,
          child: Container(
            width: width,
            height: height,
            decoration: BoxDecoration(
              color: const Color(0xFFfaf9f6),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.25),
                  offset: const Offset(4, 4),
                  blurRadius: 4.0,
                ),
              ],
            ),
            transform: Matrix4.rotationZ(-0.10),
            child: Center(
              child: Text(
                text,
                style: textStyle,
                textAlign: textAlign,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
