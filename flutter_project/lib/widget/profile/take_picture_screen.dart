import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:image/image.dart';
import 'package:permission_handler/permission_handler.dart';

class TakePictureScreen extends StatefulWidget {
  const TakePictureScreen({
    super.key,
    required this.onPictureTaken,
    required this.camera,
  });

  final CameraDescription? camera;
  final Function(String, VoidCallback) onPictureTaken;

  @override
  TakePictureScreenState createState() => TakePictureScreenState();
}

class TakePictureScreenState extends State<TakePictureScreen> {
  CameraController? _controller;
  late Future<void> _initializeControllerFuture;

  Future<void> checkCameraPermission() async {
    var status = await Permission.camera.status;
    if (!status.isGranted) {
      await Permission.camera.request();
    }
  }

  @override
  void initState() {
    super.initState();
    checkCameraPermission().then((_) {
      if (widget.camera != null) {
        _controller = CameraController(
          widget.camera!,
          ResolutionPreset.medium,
        );
        _initializeControllerFuture = _controller!.initialize().catchError((e) {
          print(e);
        });
        setState(() {});
      }
    });
  }

  @override
  void dispose() {
    _controller!.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_controller != null) {
      return Container(
        width: 750,
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Row(
            children: [
              const SizedBox(width: 25),
              Expanded(child: AppBar(title: const Text('Prendre une photo'))),
              const SizedBox(width: 25),
            ],
          ),
          Container(
            decoration: const BoxDecoration(
                borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(25),
                    bottomRight: Radius.circular(25)),
                color: Colors.black),
            child: Row(
              children: [
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: FutureBuilder<void>(
                      future: _initializeControllerFuture,
                      builder: (context, snapshot) {
                        if (snapshot.connectionState == ConnectionState.done &&
                            _controller != null) {
                          return CameraPreview(_controller!);
                        } else if (snapshot.hasError) {
                          return Text("Error: ${snapshot.error}");
                        } else {
                          return const Center(
                              child: CircularProgressIndicator());
                        }
                      },
                    ),
                  ),
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(right: 8.0),
                      child: Container(
                        height: 65.0,
                        width: 65.0,
                        child: FloatingActionButton(
                          onPressed: () async {
                            try {
                              await _initializeControllerFuture;
                              final image = await _controller!.takePicture();
                              if (!context.mounted) return;
                              final imageBytes =
                                  File(image.path).readAsBytesSync();
                              final decodedImage = decodeImage(imageBytes);
                              final size =
                                  min(decodedImage!.width, decodedImage.height);
                              final resizedImage = copyResize(
                                  copyCrop(decodedImage,
                                      x: (decodedImage.width / 2 - size / 2)
                                          .toInt(),
                                      y: (decodedImage.height / 2 - size / 2)
                                          .toInt(),
                                      width: size,
                                      height: size),
                                  width: 175);
                              String base64Image =
                                  base64Encode(encodePng(resizedImage));
                              widget.onPictureTaken(
                                  'data:image/png;base64,' + base64Image, () {
                                Navigator.of(context).pop();
                              });
                            } catch (e) {
                              print(e);
                            }
                          },
                          child: const Icon(Icons.camera_alt),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ]),
      );
    } else {
      return Container(
          width: 750,
          height: 400,
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Row(
              children: [
                const SizedBox(width: 25),
                Expanded(child: AppBar(title: const Text('Prendre une photo'))),
                const SizedBox(width: 25),
              ],
            ),
            const Expanded(
              child: Center(
                  child: Padding(
                padding: const EdgeInsets.only(bottom: 60),
                child: Text(
                  "La caméra n'est pas disponible.",
                  style: TextStyle(fontSize: 24),
                ),
              )),
            ),
          ]));
    }
  }
}
