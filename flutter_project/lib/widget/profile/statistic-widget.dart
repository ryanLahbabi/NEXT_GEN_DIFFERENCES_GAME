import 'package:flutter/material.dart';

class StatWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          buildButton(context, '4.8', 'Moyenne'),
          const SizedBox(width: 30),
          buildButton(context, '35', 'Victoires'),
          const SizedBox(width: 30),
          buildButton(context, '50', 'Défaites'),
        ],
      );

  Widget buildButton(BuildContext context, String value, String text) =>
      Container(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.start,
          children: <Widget>[
            Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 22),
            ),
            const SizedBox(height: 2),
            Text(
              text,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
      );
}
