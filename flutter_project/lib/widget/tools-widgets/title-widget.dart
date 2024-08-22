import 'package:flutter/material.dart';
import 'package:flutter_project/pages/main-page.dart';

import '../../dtos/channel-dto.dart';
import '../../service/settings-service.dart';

class CustomPaperWidget extends StatelessWidget {
  final String text;

  const CustomPaperWidget({
    Key? key,
    required this.text,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: 400,
          height: 40,
          decoration: const BoxDecoration(
            image: DecorationImage(
              image: AssetImage('assets/paper.jpg'),
              fit: BoxFit.cover,
            ),
          ),
        ),
        Positioned(
          left: 55,
          child: Stack(
            children: [
              Center(
                child: Text(
                  text,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight
                        .w900,
                  ),
                ),
              ),
            ],
          ),
        ),
        Positioned(
          top: 4,
          right: 30,
          child: GestureDetector(
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (context) => const MainPage()),
              );
            },
            child: Icon(Icons.home, size: 50.0, color: SettingsService.instance.theme == Themes.dark
                ? Colors.white : Colors.black),
          ),
        )
      ],
    );
  }
}
