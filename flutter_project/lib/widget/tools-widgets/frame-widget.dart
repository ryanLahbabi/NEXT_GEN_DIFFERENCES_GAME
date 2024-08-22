import 'package:flutter/material.dart';

import '../../dtos/channel-dto.dart';
import '../../service/settings-service.dart';
class FrameWidget extends StatelessWidget {
  final Widget child;
  final String type;


  const FrameWidget({
    Key? key,
    required this.child, // Rendre l'enfant requis
    required this.type, // Rendre l'enfant requis
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    Color frameColor;

    switch (type) {
      case 'observer':
        frameColor = Color(0xFF2AB2AD);
      case 'admin':
        frameColor = Colors.transparent;
      case 'time-limited':
        frameColor = Color(0xFFFE86A3);
        break;
      case 'waiting-games':
        frameColor = Color(0xFFFCDB00);
        break;
      case 'create-games':
        frameColor = Color(0xFF98FA98);
        break;
      default:
        frameColor = Color(0xFFFE86A3);
    }

    return LayoutBuilder(builder: (context, constraints) {
      double width = constraints.maxWidth;
      double height = constraints.maxHeight;

      return Stack(
        children: [
          Center(
            child: Container(
              width: 1300,
              height: 590,
              decoration: BoxDecoration(
                color: frameColor,
                border: Border.all(
                  color: frameColor,
                  width: 60,
                ),
              ),
              child: Center(
                child: type == 'admin' ? Align(
                  alignment: Alignment.centerLeft,
                  child: Container(
                    width: MediaQuery.of(context).size.width * 0.8,
                    padding: EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.red, width: 8),
                      image: DecorationImage(
                        image: AssetImage(
                          SettingsService.instance.theme == Themes.dark
                              ? 'assets/dark_background.png'
                              :
                          'assets/Postboard_background.png',
                        ),
                        fit: BoxFit.cover,
                      ),
                    ),
                    child: child, // Laissez l'enfant définir sa propre taille
                  ),
                ):
                Container(
                  padding: EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.red, width: 8),
                    // Assurez-vous que l'image de fond ne contraint pas l'enfant
                    image: DecorationImage(
                      image: AssetImage(
                        SettingsService.instance.theme == Themes.dark
                            ? 'assets/dark_background.png'
                            :
                        'assets/Postboard_background.png',
                      ),
                      fit: BoxFit.cover,
                    ),
                  ),
                  child: child, // Laissez l'enfant définir sa propre taille
                ),
              ),

            ),
          ),
          type == 'admin' ? Positioned(
            top: 40,
            left: 60,
            child: Image.asset('assets/green_pin.png', width: 32, height: 32),
          ) : Positioned(
            top: 40,
            left: 60,
            child: Image.asset('assets/green_pin.png', width: 32, height: 32),
          ),
          type == 'admin' ? Positioned(
            top: 45,
            right: 180,
            child: Image.asset('assets/green_pin.png', width: 32, height: 32),
          ) : Positioned(
            top: 45,
            right: 50,
            child: Image.asset('assets/green_pin.png', width: 32, height: 32),
          ),
          type == 'admin' ? Positioned(
            bottom: 60,
            left: 55,
            child: Image.asset('assets/green_pin.png', width: 32, height: 32),
          ) : Positioned(
            bottom: 60,
            left: 55,
            child: Image.asset('assets/green_pin.png', width: 32, height: 32),
          ),

          type == 'admin' ? Positioned(
            bottom: 55,
            right: 185,
            child: Image.asset('assets/green_pin.png', width: 32, height: 32),
          ) : Positioned(
            bottom: 60,
            right: 50,
            child: Image.asset('assets/green_pin.png', width: 32, height: 32),
          ),

        ],
      );
    });
  }
}
