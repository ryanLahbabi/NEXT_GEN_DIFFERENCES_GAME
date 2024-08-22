import 'package:flutter/material.dart';
import 'package:flutter_project/common/enum.dart';
import 'package:flutter_project/dtos/channel-dto.dart';
import 'package:flutter_project/service/game-service.dart';
import 'package:flutter_project/service/settings-service.dart';

class SoundBoardModal extends StatelessWidget {
  const SoundBoardModal({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(
        Icons.music_note,
        size: 30,
        color: SettingsService.instance.theme == Themes.dark
            ? Colors.white
            : Color.fromARGB(255, 49, 49, 49),
      ),
      onPressed: () => showModalBottomSheet(
        context: context,
        builder: (BuildContext context) {
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: <Sound>[
              Sound.Yippee,
              Sound.Boiii,
            ].map((sound) {
              return ListTile(
                leading: const Icon(Icons.audiotrack),
                title: Text(sound.toString().split('.').last),
                onTap: () {
                  Navigator.of(context).pop();
                  GameService.instance.sendSoundToServer(sound);
                },
              );
            }).toList(),
          );
        },
      ),
    );
  }
}
