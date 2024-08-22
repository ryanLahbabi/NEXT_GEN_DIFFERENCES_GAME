import 'package:flutter_project/common/socket-event-constants.dart';
import 'package:flutter_project/environnment.dart';
import 'package:flutter_project/service/authentication-service.dart';
import 'package:logger/logger.dart';
import 'package:socket_io_client/socket_io_client.dart';

class CommunicationSocket {
  static final CommunicationSocket instance = CommunicationSocket._internal();
  static Socket? socket;

  factory CommunicationSocket() {
    return instance;
  }

  CommunicationSocket._internal();

  Future<void> init() async {
    try {
      if (socket == null) {
        final token = await AuthService.instance.loadTokenFromLocalStorage();

        var tokenBefore = {'authorization': 'Bearer $token'};
        socket = io(
          Environnment.wsLink,
          OptionBuilder()
              .setTransports(['websocket'])
              .setPath('/socket.io/')
              .disableAutoConnect()
              .setAuth(tokenBefore)
              .build(),
        );
        socket?.auth = tokenBefore;

        if (!socket!.connected) {
          socket!.connect();
        }
      }
    } catch (e) {
      Logger().e(e);
    }
  }

  static Socket getSocket() {
    return socket!;
  }

  static void disconnect() {
    socket?.disconnect();
    socket = null;
  }

  static void on(String event, Function(dynamic) callback) {
    socket!.on(event, callback);
  }

  send<T>(String event, [T? data]) {
    if (data != null) {
      socket!.emit(event, data);
    } else {
      socket!.emit(event);
    }
  }

  static void off(String event) {
    socket?.off(event);
  }

  Future<void> showPendingFriendRequests() async {
    send(ToServer.SHOW_PENDING_FRIEND_REQUEST, null);
  }

  Future<void> sendChatMessage(Map<String, dynamic> message) async {
    print("this is send message: ");
    print(message);
    send(ToServer.SEND_CHAT_MESSAGE, message);
  }

  static void clearEventListeners() {
    socket?.off(FromServer.GLOBAL_MESSAGE);
    socket?.off(FromServer.CHAT_MESSAGE_MAIN_PAGE);
    socket?.off(FromServer.CLICK_PERSONAL);
    socket?.off(FromServer.CLICK_ENEMY);
    socket?.off(FromServer.ENDGAME);
    socket?.off(FromServer.IS_PLAYING);
    socket?.off(FromServer.CHEAT);
    socket?.off(FromServer.CHEAT_INDEX);
    socket?.off(FromServer.NEXT_CARD);
    socket?.off(FromServer.PLAYER_STATUS);
    socket?.off(FromServer.DESERTER.name);
    socket?.off(FromServer.TIME);
    socket?.off(FromServer.RESPONSE_TO_JOIN_GAME_REQUEST);
    socket?.off(FromServer.USERS_DATA);
    socket?.off(FromServer.SHOW_PENDING_FRIEND_REQUEST);
    socket?.off(FromServer.START_FRIEND_REQUEST);
    socket?.off(FromServer.END_FRIEND_REQUEST);
    socket?.off(FromServer.REMOVE_FRIEND);
    socket?.off(FromServer.ALL_GAME_CARDS);
    socket?.off(FromServer.JOINABLE_GAME_CARDS);
    socket?.off(FromServer.GAME_CARD);
    socket?.off(FromServer.CHANNEL_UPDATE);
    socket?.off(FromServer.ONGOING_GAMES);
    socket?.off(FromServer.JOIN_OBSERVER);
    socket?.off(FromServer.UPDATE_ACCESS_TYPE);
    socket?.off(FromServer.START_APP);
    socket?.off(FromServer.OBSERVER_HELP);
    socket?.off(FromServer.OBSERVER_LIST);
    socket?.off(FromServer.CHAT_MESSAGE);
    socket?.off(FromServer.SOUNDBOARD);
    socket?.off(FromServer.BLOCK_USER);
    socket?.off(FromServer.UNBLOCK_USER);
  }

  static void removeListener(String event) {
    socket?.off(event);
  }
}
