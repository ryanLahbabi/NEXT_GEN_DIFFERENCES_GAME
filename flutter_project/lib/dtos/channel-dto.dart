class InGameMessageDTO {
  String sender;
  String message;
  double timestamp;

  InGameMessageDTO({
    required this.sender,
    required this.message,
    required this.timestamp,
  });

  factory InGameMessageDTO.fromJson(Map<String, dynamic> json) {
    return InGameMessageDTO(
      sender: json['sender'],
      message: json['message'],
      timestamp: json['timestamp'].toDouble(),
    );
  }
}

class Message {
  String text;
  String time;
  bool isMessageText;
  bool messageReceived;
  String? name;

  Message({
    required this.text,
    required this.time,
    required this.isMessageText,
    required this.messageReceived,
    this.name,
  });
}

class MessagesMainPage {
  String sender;
  String message;
  String timestamp;
  bool messageReceived;
  String lobbyId;
  String avatar;

  MessagesMainPage({
    required this.sender,
    required this.message,
    required this.timestamp,
    required this.messageReceived,
    required this.lobbyId,
    required this.avatar,
  });
}

class PrivateUserDataDTO {
  String username;
  String email;
  String avatar;
  String biography;
  List<String> friends;
  GeneralGameStatisticsDTO generalGameStatistics;
  List<String> hasBlocked;
  num elo;

  PrivateUserDataDTO({
    required this.username,
    required this.email,
    required this.avatar,
    required this.biography,
    required this.friends,
    required this.generalGameStatistics,
    required this.hasBlocked,
    required this.elo,

  });

  factory PrivateUserDataDTO.fromJson(Map<String, dynamic> json) {
    return PrivateUserDataDTO(
      username: json['username'] as String,
      email: json['email'] as String,
      avatar: json['avatar'] as String,
      biography: json['biography'] as String,
      friends: List<String>.from(json['friends'] as List),
      generalGameStatistics: GeneralGameStatisticsDTO.fromJson(
          json['generalGameStatistics'] as Map<String, dynamic>),
      hasBlocked: [],
      elo: json['elo'] as num,
    );
  }
}

enum ChannelUpdateType {
  INFO,
  CREATE,
  DELETE,
}

class ConversationDTO {
  String id;
  List<InGameMessageDTO> messages;
  String name;
  String? host;

  ConversationDTO({
    required this.id,
    required this.messages,
    required this.name,
    this.host,
  });

  factory ConversationDTO.fromJson(Map<String, dynamic> json) {
    return ConversationDTO(
      id: json['id'],
      messages: (json['messages'] as List)
          .map((message) => InGameMessageDTO.fromJson(message))
          .toList(),
      name: json['name'],
      host: json['host'],
    );
  }
}

class ChannelDTO {
  String id;
  String? name;
  List<String>? members;
  String? host;

  ChannelDTO({
    required this.id,
    this.name,
    this.members,
    this.host,
  });
  factory ChannelDTO.fromJson(Map<String, dynamic> json) {
    return ChannelDTO(
      id: json['id'],
      name: json['name'],
      members: List<String>.from(json['members'] ?? []),
      host: json['host'],
    );
  }
}

// Dart enum for Language
enum Language { fr, en }

// Dart enum for Theme
enum Themes { light, dark }

// Dart class for ReceivedFriendRequestDTO
class ReceivedFriendRequestDTO {
  String from;
  bool seen;

  ReceivedFriendRequestDTO({
    required this.from,
    required this.seen,
  });
  factory ReceivedFriendRequestDTO.fromJson(Map<String, dynamic> json) {
    return ReceivedFriendRequestDTO(
      from: json['from'],
      seen: json['seen'],
    );
  }
}

// Dart class for PendingFriendRequestsDTO
class PendingFriendRequestsDTO {
  List<String> sent;
  List<ReceivedFriendRequestDTO> received;

  PendingFriendRequestsDTO({
    required this.sent,
    required this.received,
  });

  factory PendingFriendRequestsDTO.fromJson(Map<String, dynamic> json) {
    return PendingFriendRequestsDTO(
      sent: List<String>.from(json['sent'] ?? []),
      received: (json['received'] as List)
          .map((request) => ReceivedFriendRequestDTO.fromJson(request))
          .toList(),
    );
  }
}

// Dart class for InterfacePreferencesDTO
class InterfacePreferencesDTO {
  Language language;
  Themes theme;

  InterfacePreferencesDTO({
    required this.language,
    required this.theme,
  });

  // Add a fromJson constructor method
  factory InterfacePreferencesDTO.fromJson(Map<String, dynamic> json) {
    return InterfacePreferencesDTO(
      language: Language.values[json['language']],
      theme: Themes.values[json['theme']],
    );
  }
}

// Dart class for GameStatisticsDTO
class GameStatisticsDTO {
  int gamesPlayed;
  int gamesWinned;
  num averageDifferencesFound;
  num averageTimePlayed;

  GameStatisticsDTO({
    required this.gamesPlayed,
    required this.gamesWinned,
    required this.averageDifferencesFound,
    required this.averageTimePlayed,
  });

  factory GameStatisticsDTO.fromJson(Map<String, dynamic> json) {
    return GameStatisticsDTO(
      gamesPlayed: json['gamesPlayed'],
      gamesWinned: json['gamesWinned'],
      averageDifferencesFound: json['averageDifferencesFound'],
      averageTimePlayed: json['averageTimePlayed'],
    );
  }
}

// Dart class for GeneralGameStatisticsDTO
class GeneralGameStatisticsDTO {
  GameStatisticsDTO classicDeathMatch;
  GameStatisticsDTO limitedTimeDeathMatch;
  GameStatisticsDTO generalGameData;

  GeneralGameStatisticsDTO({
    required this.classicDeathMatch,
    required this.limitedTimeDeathMatch,
    required this.generalGameData,
  });

  factory GeneralGameStatisticsDTO.fromJson(Map<String, dynamic> json) {
    return GeneralGameStatisticsDTO(
      classicDeathMatch: GameStatisticsDTO.fromJson(json['classicDeathMatch']),
      limitedTimeDeathMatch:
          GameStatisticsDTO.fromJson(json['limitedTimeDeathMatch']),
      generalGameData: GameStatisticsDTO.fromJson(json['generalGameData']),
    );
  }
}

class ChannelUpdateDTO {
  ChannelUpdateType type;
  List<ChannelDTO> channelData;

  ChannelUpdateDTO({
    required this.type,
    required this.channelData,
  });

  factory ChannelUpdateDTO.fromJson(Map<String, dynamic> json) {
    return ChannelUpdateDTO(
      type: _parseUpdateType(json['type']),
      channelData: _parseChannelData(json['channelData']),
    );
  }

  static ChannelUpdateType _parseUpdateType(dynamic type) {
    switch (type) {
      case 0:
        return ChannelUpdateType.INFO;
      case 1:
        return ChannelUpdateType.CREATE;
      case 2:
        return ChannelUpdateType.DELETE;
      default:
        throw ArgumentError('Invalid ChannelUpdateType');
    }
  }

  static List<ChannelDTO> _parseChannelData(dynamic channelData) {
    if (channelData is List) {
      return channelData.map((json) => ChannelDTO.fromJson(json)).toList();
    } else {
      return [];
    }
  }
}
