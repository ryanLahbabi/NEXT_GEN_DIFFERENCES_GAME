import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_project/widget/game-play/images-difference.dart';

class AvatarWidget extends StatelessWidget {
  final String imagePath;
  final double size;
  final Base64ImageCache imageCache = Base64ImageCache();

  AvatarWidget({
    super.key,
    required this.imagePath,
    required this.size,
  });

  Future<Uint8List?> fetchImageData() async {
    const toRemove = 'data:image/png;base64,';
    return imageCache.getImage(imagePath.substring(toRemove.length));
  }

  bool isEmptyAvatar() {
    return imagePath == 'avatar_placeholder' || imagePath.isEmpty;
  }

  bool isPredefinedAvatar() {
    return !isEmptyAvatar() && !isCustomAvatar();
  }

  bool isCustomAvatar() {
    return !isEmptyAvatar() && imagePath.startsWith('data:image/png');
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        border: Border.all(
          color: Colors.black,
          width: 2,
        ),
      ),
      child: ClipOval(
        child: buildCorrectAvatar(),
      ),
    );
  }

  Widget buildCorrectAvatar() {
    if (isEmptyAvatar()) {
      return Image.asset(
        "assets/avatar-default.jpeg",
        fit: BoxFit.cover,
        width: 128,
        height: 128,
      );
    } else if (isCustomAvatar()) {
      return FutureBuilder<Uint8List?>(
        future: fetchImageData(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          } else if (snapshot.hasError || snapshot.data == null) {
            return Center(
              child: Text("Erreur de chargement de l'avatar",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      color: Colors.red[900], fontWeight: FontWeight.bold)),
            );
          } else {
            return Image.memory(
              snapshot.data!,
              fit: BoxFit.fill,
            );
          }
        },
      );
    }
    if (isPredefinedAvatar()) {
      return Image.asset(
        imagePath,
        fit: BoxFit.cover,
        width: 128,
        height: 128,
      );
    }
    return Container();
  }

  Widget buildCircle({
    required Widget child,
    required double all,
    required Color color,
  }) =>
      ClipOval(
        child: Container(
          padding: EdgeInsets.all(all),
          color: color,
          child: child,
        ),
      );
}
