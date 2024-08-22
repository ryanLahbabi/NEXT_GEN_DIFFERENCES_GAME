import { ChannelMessageDTO } from '@common/dto/channel/channel-message.dto';
import { ChannelUpdateDTO } from '@common/dto/channel/channel-update.dto';
import { GameInfo } from '@common/dto/game/game-info.dto';
import { InGameMessageDTO } from '@common/dto/game/in-game-message.dto';
import { UpdateGameAccess } from '@common/dto/game/update-game-access.dto';
import { FriendRequestResponseDTO } from '@common/dto/user/friend-request-response.dto';
import ErrorDTO from './dto/error.dto';
import { ObserverHelpResponseDTO } from './dto/game/observer-help-response.dto';
import { ObserverStateDTO } from './dto/game/observer-state.dto';
import { FriendUserDataDTO } from './dto/user/friend-user-data.dto';
import { PrivateUserDataDTO } from './dto/user/private-user-data.dto';
import { ReceivedFriendRequestDTO } from './dto/user/received-friend-request.dto';
import { Sound } from './enums/sound.enum';
import { Card } from './interfaces/game-card/card';
import { CardCreationOutputDto } from './interfaces/game-card/card-creation.dto';
import { CardFiles } from './interfaces/game-card/card-files';
import { CardPreview } from './interfaces/game-card/card-preview';
import { CardValidationOutputDto } from './interfaces/game-card/card-validation.dto';
import { ChatMessageOutputDto } from './interfaces/game-play/chat-message.dto';
import { GameClickOutputDto } from './interfaces/game-play/game-click.dto';
import { GameConnectionRequestOutputMessageDto } from './interfaces/game-play/game-connection-request.dto';
import { EndgameOutputDto } from './interfaces/game-play/game-endgame.dto';
import { GameValues } from './interfaces/game-play/game-values';
import { Hint } from './interfaces/game-play/hint';
import { GamePlayerConnectionAttemptRemarkFilter } from './interfaces/gateway-dto/game-player-connection-attempt.remark';
import { Record } from './interfaces/records/record';

export class Event<T> {
    readonly type: T;
    constructor(public readonly name: string) {}
}

export namespace ToServer {
    export const CLICK = 'send_click';
    export const GAME_CHAT_MESSAGE = 'send_game_chat_message';
    export const CHAT_MESSAGE_MAIN_PAGE = 'send_chat_message_main_page';
    export const REQUEST_TO_PLAY = 'request_to_play';
    export const CARD_VALIDATION_REQUEST = 'send_card_validation_request';
    export const CARD_CREATION_REQUEST = 'send_card_creation_request';
    export const PLAYER_VALIDATION = 'validate_player';
    export const CHEAT = 'get_cheats';
    export const LEAVE_GAME = 'leave_game';
    export const HINT = 'hint';
    export const JOINABLE_GAME_CARDS = 'joinable_game_cards';
    export const ONGOING_GAMES = 'ongoing_games';
    export const SET_GAME_VALUES = 'set_game_values';
    export const GET_GAME_VALUES = 'get_game_values';
    export const ALL_GAME_CARDS = 'all_game_cards';
    export const DELETE_ALL_CARDS = 'delete_all_cards';
    export const DELETE_ALL_RECORDS = 'delete_all_records';
    export const DELETE_CARD = 'delete_card';
    export const GET_ALL_RECORDS = 'get_all_records';
    export const RESET_BEST_TIMES = 'reset_best_times';
    export const IS_PLAYING = 'is_playing';
    export const RESET_ALL_BEST_TIMES = 'reset_all_best_times';
    export const SHOW_PENDING_FRIEND_REQUEST = 'SHOW_PENDING_FRIEND_REQUEST';
    export const START_FRIEND_REQUEST = 'START_FRIEND_REQUEST';
    export const END_FRIEND_REQUEST = 'END_FRIEND_REQUEST';
    export const USERS_DATA = 'USERS_DATA';
    export const REMOVE_FRIEND = 'REMOVE_FRIEND';
    export const SEND_CHAT_MESSAGE = 'send_chat_message';
    export const GET_ALL_CHANNELS = 'get_all_channels';
    export const START_GAME = 'start_game';
    export const JOIN_OBSERVER = 'join_observer';
    export const OBSERVER_HELP = 'observer_help';
    export const UPDATE_ACCESS_TYPE = 'game_access_type';
    export const SOUNDBOARD = 'soundboard';
    export const BLOCK_USER = 'block_user';
    export const UNBLOCK_USER = 'unblock_user';

    export const REQUEST_ACCESS_TYPE = 'request_access_type';
}

export namespace FromServer {
    export const IS_PLAYING = new Event<boolean>('is_playing');
    export const FRONTEND_CARD_TIMES = new Event<Card>('frontend_card_times');
    export const ALL_FRONTEND_CARD_TIMES = new Event<Card[]>('all_frontend_card_times');
    export const GAME_CARD = new Event<CardPreview>('game_card');
    export const SPREAD_HISTORY = new Event<Record>('history_received');
    export const PLAYER_STATUS = new Event<GamePlayerConnectionAttemptRemarkFilter>('player_status');
    export const ENDGAME = new Event<EndgameOutputDto>('endgame');
    export const CLICK_PERSONAL = new Event<GameClickOutputDto>('click_personal');
    export const CLICK_ENEMY = new Event<GameClickOutputDto>('click_enemy');
    export const RESPONSE_TO_JOIN_GAME_REQUEST = new Event<GameConnectionRequestOutputMessageDto>('response_to_play_request');
    export const CARD_VALIDATION = new Event<CardValidationOutputDto>('card_validation');
    export const CARD_CREATION = new Event<CardCreationOutputDto>('card_creation');
    export const CHAT_MESSAGE = new Event<ChannelMessageDTO>('chat_message');
    export const CHAT_MESSAGE_MAIN_PAGE = new Event<ChatMessageOutputDto>('chat_message_main_page');

    export const CHEAT = new Event<string[]>('cheat');
    export const HINT = new Event<Hint>('hint');
    export const DESERTER = new Event<string>('deserter');
    export const JOINABLE_GAME_CARDS = new Event<GameInfo[]>('joinable_game_cards');
    export const ONGOING_GAMES = new Event<GameInfo[]>('ongoing_games');
    export const CHEAT_INDEX = new Event<number>('cheat_index');
    export const GAME_VALUES = new Event<GameValues>('game_values');
    export const ALL_GAME_CARDS = new Event<CardPreview[]>('all_game_cards');
    export const CARD_DELETE_RESPONSE = new Event<boolean>('card_delete_response');
    export const GLOBAL_MESSAGE = new Event<string>('global_message');
    export const TIME = new Event<number>('time');
    export const NEXT_CARD = new Event<CardFiles>('next_card');
    export const ALL_RECORDS = new Event<Record[]>('all_records');
    export const RECORD_BEATER = new Event<string>('record_beater');
    export const SHOW_PENDING_FRIEND_REQUEST = new Event<ReceivedFriendRequestDTO[]>('SHOW_PENDING_FRIEND_REQUEST');
    export const START_FRIEND_REQUEST = new Event<string>('START_FRIEND_REQUEST');
    export const END_FRIEND_REQUEST = new Event<FriendRequestResponseDTO>('END_FRIEND_REQUEST');
    export const USERS_DATA = new Event<FriendUserDataDTO[]>('USERS_DATA');
    export const SOCKET_ERRORS = new Event<ErrorDTO>('SOCKET_ERRORS');
    export const IN_GAME_MESSAGE = new Event<InGameMessageDTO>('InGameMessageDTO');
    export const START_APP = new Event<PrivateUserDataDTO>('start_app');
    export const CHANNEL_UPDATE = new Event<ChannelUpdateDTO>('CHANNEL_UPDATE');
    export const JOIN_OBSERVER = new Event<ObserverStateDTO>('join_observer');
    export const OBSERVER_HELP = new Event<ObserverHelpResponseDTO>('observer_help');
    export const OBSERVER_LIST = new Event<string[]>('observer_list');
    export const UPDATE_ACCESS_TYPE = new Event<UpdateGameAccess>('game_access_type');
    export const SOUNDBOARD = new Event<Sound>('soundboard');
    export const BLOCK_USER = new Event<string>('block_user');
    export const UNBLOCK_USER = new Event<string>('unblock_user');
    export const LIKES = new Event<{ cardId: string; likes: number }>('likes');
    
}
