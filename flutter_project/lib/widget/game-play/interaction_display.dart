import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_project/classes/gamePlay/observer-help.dart';
import 'package:flutter_project/service/delay-service.dart';
import 'package:flutter_project/service/observer-service.dart';
import 'package:flutter_project/common/replay-constants.dart';

class InteractionDisplay extends CustomPainter {
  final DelayService _delayService = DelayService();
  final List<ObserverHelpResponseDTO> _interactions =
      List<ObserverHelpResponseDTO>.empty(growable: true);
  Coordinates _firstCornerCoord = Coordinates(0, 0);
  Coordinates _secondCornerCoord = Coordinates(0, 0);
  bool isDrawingInteraction = false;

  void onPanStart(Offset offset) {
    if (ObserverService.instance.state == InteractionState.Started) {
      isDrawingInteraction = true;
      _firstCornerCoord = Coordinates(offset.dx.toInt(), offset.dy.toInt());
      _secondCornerCoord = Coordinates(offset.dx.toInt(), offset.dy.toInt());
    }
  }

  void onPanUpdate(Offset offset) {
    if (ObserverService.instance.state == InteractionState.Started) {
      _secondCornerCoord = Coordinates(offset.dx.toInt(), offset.dy.toInt());
    }
  }

  void onPanEnd() {
    if (ObserverService.instance.state == InteractionState.Started) {
      ObserverService.instance
          .sendInteraction(_firstCornerCoord, _secondCornerCoord);
      Timer(Duration(seconds: ObserverService.instance.interactionDuration),
          () => isDrawingInteraction = false);
    }
  }

  void addInteraction(ObserverHelpResponseDTO interaction) {
    _interactions.add(interaction);
    _delayService.wait(INTERACTION_DURATION);
    Timer(Duration(seconds: ObserverService.instance.interactionDuration),
        () => _interactions.remove(interaction));
  }

  void _drawInteraction(
      Size canvasSize, ObserverHelpCoordinates zoneCoordinates, Canvas canvas,
      [String? senderUsername]) {
    _drawRectangle(
        canvas,
        Rect.fromLTRB(
            zoneCoordinates.upperLeft.x.toDouble(),
            zoneCoordinates.upperLeft.y.toDouble(),
            zoneCoordinates.lowerRight.x.toDouble(),
            zoneCoordinates.lowerRight.y.toDouble()),
        Color.fromARGB(75, 255, 255, 255),
        Colors.yellow);
    if (senderUsername != null) {
      _writeText(
          canvasSize,
          senderUsername,
          Offset(zoneCoordinates.upperLeft.x.toDouble(),
              zoneCoordinates.lowerRight.y.toDouble()),
          canvas,
          ObserverService.instance.interactionTextSize,
          Colors.black,
          const Color.fromARGB(127, 255, 255, 255));
    }
  }

  _drawRectangle(Canvas canvas, Rect rect, Color fillColor,
      [Color? strokeColor]) {
    Paint paint = new Paint();
    paint.color = fillColor;
    paint.style = PaintingStyle.fill;
    canvas.drawRect(rect, paint);
    if (strokeColor != null) {
      paint.color = strokeColor;
      paint.style = PaintingStyle.stroke;
      paint.strokeWidth = 3;
      canvas.drawRect(rect, paint);
    }
  }

  _writeText(Size canvasSize, String text, Offset upperLeftCorner,
      Canvas canvas, int fontSize, Color textColor,
      [Color? backgroundColor]) {
    const padding = 5;
    final textStyle = TextStyle(
      color: textColor,
      fontSize: fontSize.toDouble(),
      fontFamily: 'sans-serif',
    );
    final textSpan = TextSpan(
      text: text,
      style: textStyle,
    );
    final textPainter = TextPainter(
      text: textSpan,
      textDirection: TextDirection.ltr,
    );
    textPainter.layout(
      minWidth: 0,
      maxWidth: canvasSize.width,
    );
    final width = _textSize(text, textStyle).width + padding * 2;
    final height = _textSize(text, textStyle).height + padding * 2;
    if (backgroundColor != null) {
      _drawRectangle(
          canvas,
          Rect.fromLTWH(upperLeftCorner.dx, upperLeftCorner.dy, width, height),
          backgroundColor);
    }
    textPainter.paint(canvas,
        Offset(upperLeftCorner.dx + padding, upperLeftCorner.dy + padding));
  }

  Size _textSize(String text, TextStyle style) {
    final TextPainter textPainter = TextPainter(
        text: TextSpan(text: text, style: style),
        maxLines: 1,
        textDirection: TextDirection.ltr)
      ..layout(minWidth: 0, maxWidth: double.infinity);
    return textPainter.size;
  }

  @override
  void paint(Canvas canvas, Size size) {
    if (isDrawingInteraction) {
      _drawInteraction(
          size,
          ObserverService.instance.computeZoneCoordinates(
            _firstCornerCoord,
            _secondCornerCoord,
          ),
          canvas);
    }
    for (ObserverHelpResponseDTO interaction in _interactions) {
      _drawInteraction(size, interaction.zoneCoordinates, canvas,
          interaction.observerUsername);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
