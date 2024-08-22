import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_project/service/game-data-service.dart';
import 'package:flutter_project/service/game-service.dart';
import 'package:flutter_project/service/observer-service.dart';
import 'package:flutter_project/service/replay-service.dart';
import 'package:flutter_project/widget/game-play/interaction_display.dart';

class Base64ImageCache {
  final Map<String, Uint8List> _cache = {};

  Uint8List getImage(String base64String) {
    return _cache.putIfAbsent(base64String, () => base64Decode(base64String));
  }
}

class ImageWithHeader extends StatefulWidget {
  final String header;
  final String imageName;
  final double imageWidth;

  const ImageWithHeader({
    Key? key,
    required this.header,
    required this.imageName,
    required this.imageWidth,
  }) : super(key: key);

  @override
  State<ImageWithHeader> createState() => _ImageWithHeaderState();
}

class _ImageWithHeaderState extends State<ImageWithHeader> {
  late GameService gameService;
  final Base64ImageCache imageCache = Base64ImageCache();
  final GlobalKey _canvasKey = new GlobalKey();
  InteractionDisplay interactionDisplay = InteractionDisplay();

  @override
  void initState() {
    super.initState();
    ObserverService().interactionStream.listen((interaction) {
      interactionDisplay.addInteraction(interaction);
      _canvasKey.currentContext?.findRenderObject()?.markNeedsPaint();
    });
  }

  Future<Uint8List?> fetchImageData() async {
    return imageCache.getImage(widget.imageName);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: widget.imageWidth,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(8.0),
            decoration: const BoxDecoration(
              color: Colors.blue,
              border: Border(
                top: BorderSide(color: Colors.black, width: 2),
                left: BorderSide(color: Colors.black, width: 2),
                right: BorderSide(color: Colors.black, width: 2),
              ),
            ),
            child: Text(
              widget.header,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          FutureBuilder<Uint8List?>(
            future: fetchImageData(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return Container(
                  width: widget.imageWidth,
                  height: 480,
                  child: const Center(child: CircularProgressIndicator()),
                );
              } else if (snapshot.hasError || snapshot.data == null) {
                return Container(
                  width: widget.imageWidth,
                  height: 480,
                  child: const Center(child: Text("Error loading image")),
                );
              } else {
                return GestureDetector(
                  onPanDown: (detailData) {
                    interactionDisplay.onPanStart(detailData.localPosition);
                  },
                  onPanUpdate: (detailData) {
                    interactionDisplay.onPanUpdate(detailData.localPosition);
                    _canvasKey.currentContext
                        ?.findRenderObject()
                        ?.markNeedsPaint();
                  },
                  onPanEnd: (detailData) {
                    interactionDisplay.onPanEnd();
                  },
                  onTapDown: (TapDownDetails details) {
                    final globalPosition = details.globalPosition;
                    final localPosition = details.localPosition;
                    final x = localPosition.dx;
                    final y = localPosition.dy;
                    final globalX = globalPosition.dx;
                    final globalY = globalPosition.dy;
                    GameService.instance.requestServerCheck(
                        x.toInt(), y.toInt(), globalX.toInt(), globalY.toInt());
                  },
                  child: Stack(
                    children: [
                      Container(
                        width: widget.imageWidth,
                        height: 480,
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.black, width: 2),
                        ),
                        child: Image.memory(
                          snapshot.data!,
                          fit: BoxFit.fill,
                        ),
                      ),
                      Container(
                        width: widget.imageWidth,
                        height: 480,
                        child: CustomPaint(
                          key: _canvasKey,
                          painter: interactionDisplay,
                        ),
                      ),
                    ],
                  ),
                );
              }
            },
          ),
        ],
      ),
    );
  }
}

class ImageDifference extends StatefulWidget {
  final Stream<String> overlayStream;
  final double width, height;

  const ImageDifference({
    Key? key,
    required this.overlayStream,
    required this.width,
    required this.height,
  }) : super(key: key);

  @override
  State<ImageDifference> createState() => _ImageDifferenceState();
}

class _ImageDifferenceState extends State<ImageDifference> {
  List<Image> overlays = [];

  void resetOverlays() {
    if (mounted) {
      if (GameDataService().isGameServiceInitialized) {
        setState(() {
          overlays.clear();
        });
      }
    }
  }

  @override
  void initState() {
    super.initState();
    widget.overlayStream.listen((base64Image) {
      if (mounted) {
        setState(() {
          overlays
              .add(Image.memory(base64Decode(base64Image), fit: BoxFit.cover));
        });
      }
    });
    //resetOverlays();

    ReplayService().isResetReplayStream.listen((isDifferenceReset) {
      if (isDifferenceReset == true) {
        if (mounted) {
          setState(() {
            overlays.clear();
            print("clearing overlays");
          });
        }
      }
      //GameDataService().isGameServiceInitialized = isDifferenceReset;
    });

    if (GameDataService().alreadyFoundDifferences.isNotEmpty) {
      GameDataService().alreadyFoundDifferences.forEach((diff) {
        if (mounted) {
          setState(() {
            overlays.add(Image.memory(base64Decode(diff), fit: BoxFit.cover));
          });
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 640,
      height: 480,
      child: Stack(
        children: [
          ...overlays,
          GestureDetector(
            onTapDown: (TapDownDetails details) {
              final globalPosition = details.globalPosition;
              final localPosition = details.localPosition;
              final x = localPosition.dx;
              final y = localPosition.dy;
              final globalX = globalPosition.dx;
              final globalY = globalPosition.dy;
              GameService.instance.requestServerCheck(
                  x.toInt(), y.toInt(), globalX.toInt(), globalY.toInt());
            },
          ),
        ],
      ),
    );
  }
}
