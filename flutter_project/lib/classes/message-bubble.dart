class MessageBubble {
  String message;
  String mediaUrl;
  bool isSent;
  int time;
  String senderName;
  final MessageType type;
  String? avatar;

  MessageBubble({
    required this.message,
    this.mediaUrl = '',
    required this.isSent,
    required this.time,
    required this.senderName,
    this.type = MessageType.text,
    this.avatar,
  });
}

enum MessageType { text, gif }
