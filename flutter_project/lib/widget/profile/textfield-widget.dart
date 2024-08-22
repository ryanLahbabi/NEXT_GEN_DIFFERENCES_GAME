import 'package:flutter/material.dart';

//inspirée de https://www.youtube.com/watch?v=ZfSiFtT0z_I&ab_channel=HeyFlutter%E2%80%A4com

class TextFieldWidget extends StatefulWidget {
  final int maxLines;
  final int maxLength;
  final TextEditingController controller;
  final String label;
  final String text;
  final ValueChanged<String> onChanged;

  const TextFieldWidget({
    Key? key,
    this.maxLines = 3,
    this.maxLength = 100,
    required this.controller,
    required this.label,
    required this.text,
    required this.onChanged,
  }) : super(key: key);

  @override
  _TextFieldWidgetState createState() => _TextFieldWidgetState();
}

class _TextFieldWidgetState extends State<TextFieldWidget> {
  late final TextEditingController controller;

  @override
  void initState() {
    super.initState();

    controller = TextEditingController(text: widget.text);
    controller.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    if (controller.text.length > 15) {
      final newText = controller.text.substring(0, 15);
      controller.value = controller.value.copyWith(
        text: newText,
        selection: TextSelection.collapsed(offset: newText.length),
      );
    }
    widget.onChanged(controller.text);
  }

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.label,
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: controller,
            decoration: InputDecoration(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            maxLines: widget.maxLines,
          ),
        ],
      );
}
