import 'package:flutter/material.dart';

class ImageCarousel extends StatelessWidget {
  final List<String> carouselImages;
  final Function(String, VoidCallback) onImageSelected;

  const ImageCarousel({
    Key? key,
    required this.carouselImages,
    required this.onImageSelected,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
        color: Colors.white,
        child: GridView.count(
            crossAxisCount: 4,
            children: List.generate(carouselImages.length, (index) {
              return Center(
                child: GestureDetector(
                  onTap: () {
                    onImageSelected(carouselImages[index], () {
                      Navigator.of(context).pop();
                    });
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Image.asset(carouselImages[index]),
                  ),
                ),
              );
            })));
  }
}
