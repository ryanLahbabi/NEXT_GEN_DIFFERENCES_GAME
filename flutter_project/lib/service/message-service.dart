import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_project/classes/communication-socket.dart';
import 'package:flutter_project/common/socket-event-constants.dart';
import 'package:flutter_project/dtos/channel-dto.dart';
import 'package:flutter_project/dtos/channel-message-dto.dart';
import 'package:flutter_project/environnment.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:flutter_project/service/noftification-service.dart';
import 'package:flutter_project/service/settings-service.dart';
import 'package:flutter_project/service/user-service.dart';
import 'package:http/http.dart' as http;

class Conversation {
  String id;
  List<MessagesMainPage> messages;
  String name;
  String? host;

  Conversation({
    required this.id,
    required this.messages,
    required this.name,
    this.host,
  });
}

class Message1 {
  String content;
  String avatar;
  bool sentByMe;
  int timestamp;
  String sender;

  Message1({
    required this.content,
    required this.avatar,
    required this.sentByMe,
    required this.timestamp,
    required this.sender,
  });
}

class MessageService extends ChangeNotifier {
  String? gameId;
  String focusedConversationId = '';

  List<ChannelDTO> _allChannels = [];
  List<Conversation> _myConversations = [];
  List<dynamic> _myChannelIds = [];
  bool _gaming = false;

  void Function()? channelChangeCallBack;

  static final MessageService _instance = MessageService._internal();
  bool _drawerIsVisible = false;
  final ValueNotifier<List<Message1>> messages =
      ValueNotifier<List<Message1>>([]);
  final ValueNotifier<bool> hasUnreadMessage = ValueNotifier<bool>(false);

  List<Conversation> get myChannels {
    if (_gaming) {
      var gamingChannel = _myConversations.firstWhere((c) => c.id == 'gaming');
      return [gamingChannel]
        ..addAll(_myConversations.where((c) => c.id != 'gaming'));
    } else {
      return _myConversations;
    }
  }

  List<ChannelDTO> get otherChannels {
    var joinedChannelIds = myChannels.map((mc) => mc.id).toList();
    return _allChannels.where((c) => !joinedChannelIds.contains(c.id)).toList();
  }

  Conversation get focusedConversation {
    return _myConversations.firstWhere((c) => c.id == focusedConversationId,
        orElse: () => _myConversations.firstWhere((c) => c.id == '0'));
  }

  void addGamingChannel(String gameId) {
    if (!_gaming) {
      this.gameId = gameId;
      _gaming = true;
      _myConversations
          .add(Conversation(id: 'gaming', messages: [], name: 'Game Lobby'));
    }
    if (channelChangeCallBack != null) channelChangeCallBack!();
  }

  void removeGamingChannel() {
    if (_gaming) {
      gameId = null;
      _gaming = false;
      _myConversations =
          _myConversations.where((c) => c.id != 'gaming').toList();
    }
    if (channelChangeCallBack != null) channelChangeCallBack!();
  }

  Future<dynamic> _joinChannelRequest(String channelId) async {
    final token = await AuthService.instance.getToken();
    return http.post(
      Uri.parse('${Environnment.httpLink}/chan/join'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({'channelId': channelId}),
    );
  }

  void joinChannel(String channelId) {
    var hasAlreadyJoined =
        _myConversations.map((m) => m.id).contains(channelId);
    if (!hasAlreadyJoined) {
      _joinChannelRequest(channelId).then((_) {
        var channel = _allChannels.firstWhere((c) => c.id == channelId);
        _myConversations.add(Conversation(
          id: channelId,
          messages: [],
          name: channel?.name ?? 'ERROR CHANNEL NOT FOUND LOCALLY',
          host: channel?.host,
        ));
        if (channelChangeCallBack != null) channelChangeCallBack!();
      });
    }
  }

  Future<dynamic> _leaveChannelRequest(String channelId) async {
    final token = await AuthService.instance.getToken();
    return http.post(
      Uri.parse('${Environnment.httpLink}/chan/leave'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({'channelId': channelId}),
    );
  }

  void leaveChannel(String channelId) {
    var hasJoined = _myConversations.any((m) => m.id == channelId);
    if (hasJoined) {
      _leaveChannelRequest(channelId).then((_) {
        _myConversations =
            _myConversations.where((c) => c.id != channelId).toList();
        if (channelId == focusedConversationId) focusedConversationId = '';
        if (channelChangeCallBack != null) channelChangeCallBack!();
      });
    }
  }

  Future<dynamic> _createChannelRequest(String name) async {
    final token = await AuthService.instance.getToken();
    return http.post(
      Uri.parse('${Environnment.httpLink}/chan/create'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({'name': name}),
    );
  }

  void createChannel(String name) {
    _createChannelRequest(name).then((response) {
      String channelId = json.decode(response.body)['channelId'];
      _myChannelIds.add(channelId);
      _myConversations.add(Conversation(
        id: channelId,
        messages: [],
        name: name,
        host: AuthService.instance.username,
      ));
      if (channelChangeCallBack != null) channelChangeCallBack!();
    });
  }

  Future<dynamic> _deleteChannelRequest(String channelId) async {
    final token = await AuthService.instance.getToken();
    return http.delete(
      Uri.parse('${Environnment.httpLink}/chan'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: json.encode({'channelId': channelId}),
    );
  }

  void deleteChannel(String channelId) {
    var hasJoined = _myConversations.any((m) => m.id == channelId);
    if (hasJoined) {
      _deleteChannelRequest(channelId).then((_) {
        _myConversations =
            _myConversations.where((c) => c.id != channelId).toList();
        if (channelId == focusedConversationId) focusedConversationId = '';
        if (channelChangeCallBack != null) channelChangeCallBack!();
      });
    }
  }

  void sendGif(String url, [String? channelId]) {
    channelId ??= focusedConversationId;

    final messageDto = {
      'message': url,
      'isAGif': true,
      'channelId': channelId,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    };
    CommunicationSocket.instance.send(ToServer.SEND_CHAT_MESSAGE, messageDto);
  }

  void sendMessage(String message, [String? channelId]) {
    channelId ??= focusedConversationId;

    if (_gaming && channelId == 'gaming' && gameId != null) {
      final messageData = {
        'gameId': gameId!,
        'message': message,
        'isAGIF': false,
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      };
      CommunicationSocket.instance
          .send(ToServer.GAME_CHAT_MESSAGE, messageData);
    } else {
      final messageDto = {
        'message': message,
        'channelId': channelId,
        'isAGIF': false,
        'timestamp': DateTime.now().millisecondsSinceEpoch,
      };
      CommunicationSocket.instance.send(ToServer.SEND_CHAT_MESSAGE, messageDto);
    }
  }

  List<MessagesMainPage> getMessages(String conversationId) {
    return _myConversations
        .firstWhere((c) => c.id == conversationId,
            orElse: () => Conversation(id: '', messages: [], name: ''))
        .messages;
  }

  List<Message1> getFocusedMessages() {
    return _myConversations
            .firstWhere((c) => c.id == focusedConversationId,
                orElse: () => Conversation(id: '', messages: [], name: ''))
            .messages
            .map((m) => Message1(
                  sentByMe: m.sender == AuthService.instance.username,
                  content: m.message,
                  avatar: m.avatar,
                  timestamp: int.tryParse(m.timestamp) ?? 0,
                  sender: m.sender,
                ))
            .toList() ??
        [];
  }

  MessagesMainPage? filterMessage(
      ChannelMessageDTO messageDto, Map<String, dynamic>? getGlobalMessage) {
    dynamic message = 'Error no message';
    bool messageReceived = true;
    String sender = 'ERROR UNDEFINED SENDER';

    switch (messageDto.type) {
      case ChannelMessageType.UserMessage:
      case ChannelMessageType.GifUri:
        if (messageDto.sender == null) break;
        message = messageDto.message ?? '';
        sender = messageDto.sender!;
        // if (messageDto.sender == AuthService.instance.username)
        //   _receivedMyMessage = true;
        break;
      case ChannelMessageType.GlobalAction:
        if (getGlobalMessage == null) break;
        String language =
            SettingsService.instance.language == Language.en ? 'en' : 'fr';
        message = getGlobalMessage[language];
        messageReceived = false;
        sender = 'GLOBAL MESSAGE';
        break;
      // case ChannelMessageType.GifUri:
      // if (messageDto.sender == null) break;
      // if (messageDto.message?.contains('<img') ?? false) {
      //   message = sanitizer.bypassSecurityTrustHtml(messageDto.message!);
      // } else {
      //   message = giftSelectionService.transformGifLinks(messageDto.message!);
      // }
      // sender = messageDto.sender;
      // break;
      default:
        break;
    }

    return MessagesMainPage(
      avatar: messageDto.avatar ?? 'avatar_placeholder',
      message: message.toString(),
      timestamp: messageDto.timestamp.toString(),
      messageReceived: messageReceived,
      sender: sender,
      lobbyId: messageDto.channelId,
    );
  }

  final ValueNotifier<Map<String, int>> unreadMessagesPerChat =
      ValueNotifier({});

  MessageService._internal();

  static MessageService get instance => _instance;

  void setDrawerVisibility(bool isVisible) {
    _drawerIsVisible = isVisible;
  }

  bool get drawerIsVisible => _drawerIsVisible;

  void markMessageAsRead() {
    hasUnreadMessage.value = false;
    unreadMessagesPerChat.notifyListeners();
  }

  void receiveMessage(String channelId, String selectedConversationId) {
    if (selectedConversationId != channelId) {
      if (focusedConversationId != channelId) {
        unreadMessagesPerChat.value
            .update(channelId, (value) => value + 1, ifAbsent: () => 1);
        unreadMessagesPerChat.notifyListeners();
        hasUnreadMessage.value = true;
        hasUnreadMessage.notifyListeners();
      }
    } else {
      MessageService.instance.markMessagesAsRead(selectedConversationId);
    }
  }

  void markMessagesAsRead(String channelId) {
    unreadMessagesPerChat.value.remove(channelId);
    if (unreadMessagesPerChat.value.isEmpty) {
      hasUnreadMessage.value = false;
      hasUnreadMessage.notifyListeners();
    } else {
      hasUnreadMessage.value = true;
      hasUnreadMessage.notifyListeners();
    }
  }

  int getUnreadMessageCount(String channelId) {
    return unreadMessagesPerChat.value[channelId] ?? 0;
  }

  Future<void> init() async {
    var userData = await UserDataService.instance.fetchUserData();
    _myChannelIds = userData['channels'];
    _myConversations = [
      Conversation(
        id: '0',
        messages: [],
        name: 'Chat General',
        host: '',
      )
    ];

    CommunicationSocket.on(FromServer.CHANNEL_UPDATE, (data) async {
      var update = ChannelUpdateDTO.fromJson(data);
      switch (update.type) {
        case ChannelUpdateType.INFO:
          if (_allChannels.isNotEmpty) {
            if (_allChannels.any((c) => c.id == update.channelData[0].id)) {
              var channel = _allChannels
                  .firstWhere((c) => c.id == update.channelData[0].id);
              channel.host = update.channelData[0].host;
            }
            if (_myConversations.any((c) => c.id == update.channelData[0].id)) {
              var myChannel = _myConversations
                  .firstWhere((c) => c.id == update.channelData[0].id);
              myChannel.host = update.channelData[0].host;
            }
          } else {
            _allChannels = List<ChannelDTO>.from(update.channelData);
            update.channelData.forEach((channel) {
              var inChannel = _myChannelIds.contains(channel.id);
              var addChannel =
                  inChannel && !_myConversations.any((c) => c.id == channel.id);
              if (addChannel) {
                _myConversations.add(Conversation(
                  id: channel.id,
                  name: channel.name ?? '',
                  messages: [],
                  host: channel.host,
                ));
              }
            });
          }
          break;
        case ChannelUpdateType.CREATE:
          _allChannels.add(update.channelData[0]);
          break;
        case ChannelUpdateType.DELETE:
          _allChannels.removeWhere((c) => c.id == update.channelData[0].id);
          break;
      }
      if (channelChangeCallBack != null) channelChangeCallBack!();
    });
    await CommunicationSocket.instance.send(ToServer.GET_ALL_CHANNELS);

    final notificationService = NotificationService();

    CommunicationSocket.on(FromServer.CHAT_MESSAGE, (data) {
      var channel;
      ChannelMessageDTO messageDto = ChannelMessageDTO.fromJson(data);
      if (_myConversations
          .any((element) => element.id == messageDto.channelId)) {
        channel =
            _myConversations.firstWhere((c) => c.id == messageDto.channelId);
      } else {
        channel = null;
      }
      if (channel != null) {
        var filteredMessage =
            filterMessage(messageDto, data['getGlobalMessage']);
        if (filteredMessage != null) {
          channel.messages.insert(0, filteredMessage);
          messages.value = getFocusedMessages();
          if (focusedConversationId != messageDto.channelId) {
            notificationService.showNotification(
                "Nouveau message", filteredMessage.message);
            receiveMessage(data['channelId'],
                MessageService.instance.focusedConversationId);
          }
        }
      }
    });
  }

  void selectChannel(String id) {
    focusedConversationId = id;
    messages.value = getFocusedMessages();
  }

  void logout() {
    messages.value = [];
    _myConversations = [];
    _allChannels = [];
    _myChannelIds = [];
    focusedConversationId = '';
  }
}
