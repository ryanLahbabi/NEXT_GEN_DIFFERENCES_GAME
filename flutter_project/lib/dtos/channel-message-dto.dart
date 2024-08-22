// Assuming you have created an enum file
import 'channel-dto.dart';

typedef TranslatedAction = Map<Language, String>;

class ChannelMessageDTO {
  final ChannelMessageType type;
  final String? avatar;
  final int timestamp;
  final String channelId;
  final String? sender;
  final String? message;
  final TranslatedAction? getGlobalMessage;
  // bool isAGif;

  ChannelMessageDTO({
    required this.type,
    required this.timestamp,
    required this.channelId,
    required this.avatar,
    this.sender,
    this.message,
    this.getGlobalMessage,
    // this.isAGif = false,
  });

  // Factory constructor to deserialize JSON into ChannelMessageDTO object
  factory ChannelMessageDTO.fromJson(Map<String, dynamic> json) {
    return ChannelMessageDTO(
      type: _parseChannelMessageType(json['type']),
      timestamp: json['timestamp'] ?? 0,
      channelId: json['channelId'] ?? '',
      avatar: json['avatar'],
      sender: json['sender'],
      message: json['message'],
      // Add more fields here if needed
      // isAGif: json['isAGif'] ?? false,
    );
  }
  static ChannelMessageType _parseChannelMessageType(int value) {
    switch (value) {
      case 0:
        return ChannelMessageType.GifUri;
      case 1:
        return ChannelMessageType.GlobalAction;
      case 2:
        return ChannelMessageType.UserMessage;
      default:
        return ChannelMessageType.Default;
    }
  }

  // Method to serialize ChannelMessageDTO object into JSON
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    data['type'] = type;
    data['timestamp'] = timestamp;
    data['channelId'] = channelId;
    data['avatar'] = avatar;
    if (sender != null) data['sender'] = sender;
    if (message != null) data['message'] = message;
    // Add more fields here if needed
    // data['isAGif'] = isAGif;
    return data;
  }
}

enum ChannelMessageType {
  GifUri,
  GlobalAction,
  UserMessage,
  Default,
}
