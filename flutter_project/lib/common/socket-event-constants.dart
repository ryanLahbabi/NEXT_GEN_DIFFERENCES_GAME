class Event<T> {
  final String name;
  final T type;

  Event(this.name, this.type);
}

class FromServer {
  static const String GLOBAL_MESSAGE = 'global_message';
  static const String CHAT_MESSAGE_MAIN_PAGE = 'chat_message_main_page';
  static const String CLICK_PERSONAL = 'click_personal';
  static const String CLICK_ENEMY = 'click_enemy';
  static const String ENDGAME = 'endgame';
  static const String IS_PLAYING = 'is_playing';
  static const String CHEAT = 'cheat';
  static const String CHEAT_INDEX = 'cheat_index';
  static const String NEXT_CARD = 'next_card';
  static const String PLAYER_STATUS = 'player_status';

  static final Event<String> DESERTER = Event<String>('deserter', "");
  static const String TIME = 'time';
  static const String RESPONSE_TO_JOIN_GAME_REQUEST =
      'response_to_play_request';
  static const String USERS_DATA = 'USERS_DATA';
  static const String SHOW_PENDING_FRIEND_REQUEST =
      'SHOW_PENDING_FRIEND_REQUEST';
  static const String START_FRIEND_REQUEST = 'START_FRIEND_REQUEST';
  static const String END_FRIEND_REQUEST = 'END_FRIEND_REQUEST';
  static const String REMOVE_FRIEND = 'REMOVE_FRIEND';
  static const String ALL_GAME_CARDS = 'all_game_cards';
  static const String JOINABLE_GAME_CARDS = 'joinable_game_cards';
  static const String GAME_CARD = 'game_card';
  static const String CHANNEL_UPDATE = 'CHANNEL_UPDATE';
  static const String ONGOING_GAMES = 'ongoing_games';
  static const String JOIN_OBSERVER = 'join_observer';
  static const String UPDATE_ACCESS_TYPE = 'game_access_type';
  static const String START_APP = 'start_app';
  static const String OBSERVER_HELP = 'observer_help';
  static const String OBSERVER_LIST = 'observer_list';
  static const String CHAT_MESSAGE = 'chat_message';
  static const String SOUNDBOARD = 'soundboard';
  static const String BLOCK_USER = 'block_user';
  static const String UNBLOCK_USER = 'unblock_user';

}

class ToServer {
  static const String GAME_CHAT_MESSAGE = 'send_game_chat_message';
  static const String SEND_CHAT_MESSAGE = 'send_chat_message';
  static const String CHAT_MESSAGE_MAIN_PAGE = 'send_chat_message_main_page';
  static const String CLICK = 'send_click';
  static const String REQUEST_TO_PLAY = 'request_to_play';
  static const String IS_PLAYING = 'is_playing';
  static const String CHEAT = 'get_cheats';
  static const String LEAVE_GAME = 'leave_game';

  static const String USERS_DATA = 'USERS_DATA';
  static const String SHOW_PENDING_FRIEND_REQUEST =
      'SHOW_PENDING_FRIEND_REQUEST';
  static const String START_FRIEND_REQUEST = 'START_FRIEND_REQUEST';
  static const String END_FRIEND_REQUEST = 'END_FRIEND_REQUEST';
  static const String REMOVE_FRIEND = 'REMOVE_FRIEND';
  static const String ALL_GAME_CARDS = 'all_game_cards';
  static const String JOINABLE_GAME_CARDS = 'joinable_game_cards';
  static const String GET_ALL_CHANNELS = 'get_all_channels';
  static const String ONGOING_GAMES = 'ongoing_games';
  static const String JOIN_OBSERVER = 'join_observer';
  static const String SOUNDBOARD = 'soundboard';
  static const String UPDATE_ACCESS_TYPE = 'game_access_type';
  static const String OBSERVER_HELP = 'observer_help';
  static const String OBSERVER_LIST = 'observer_list';
  static const String BLOCK_USER = 'block_user';
  static const String UNBLOCK_USER = 'unblock_user';

}
