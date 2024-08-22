import * as Events from '@common/socket-event-constants';
import { OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import EmissionFilter from './emission-filter';
import { GATEWAY_PORT } from './game.gateway.constants';

@WebSocketGateway(GATEWAY_PORT)
export default class OutputFilterGateway implements OnGatewayInit {
    static sendAllRecords = new EmissionFilter(Events.FromServer.ALL_RECORDS);
    static sendCardValidationResponse = new EmissionFilter(Events.FromServer.CARD_VALIDATION);
    static sendCardCreationResponse = new EmissionFilter(Events.FromServer.CARD_CREATION);
    static sendOtherClick = new EmissionFilter(Events.FromServer.CLICK_ENEMY);
    static sendChatMessage = new EmissionFilter(Events.FromServer.CHAT_MESSAGE);
    static sendDeleteAllCardsOutcome = new EmissionFilter(Events.FromServer.CARD_DELETE_RESPONSE);
    static sendCardPreviews = new EmissionFilter(Events.FromServer.ALL_GAME_CARDS);
    static sendAllCardPreviewTimes = new EmissionFilter(Events.FromServer.ALL_FRONTEND_CARD_TIMES);
    static sendCardTimes = new EmissionFilter(Events.FromServer.FRONTEND_CARD_TIMES);
    static sendCardPreview = new EmissionFilter(Events.FromServer.GAME_CARD);
    static sendJoinableGames = new EmissionFilter(Events.FromServer.JOINABLE_GAME_CARDS);
    static sendOnGoingGames = new EmissionFilter(Events.FromServer.ONGOING_GAMES);
    static sendGlobalMessage = new EmissionFilter(Events.FromServer.GLOBAL_MESSAGE);
    static sendRecordBeaterMessage = new EmissionFilter(Events.FromServer.RECORD_BEATER);
    static sendEndgameMessage = new EmissionFilter(Events.FromServer.ENDGAME);
    static sendPlayerConnectionMessage = new EmissionFilter(Events.FromServer.PLAYER_STATUS);
    static sendConnectionAttemptResponseMessage = new EmissionFilter(Events.FromServer.RESPONSE_TO_JOIN_GAME_REQUEST);
    static sendDeserterMessage = new EmissionFilter(Events.FromServer.DESERTER);
    static sendClickResponseMessage = new EmissionFilter(Events.FromServer.CLICK_PERSONAL);
    static sendAllCheatFlashImages = new EmissionFilter(Events.FromServer.CHEAT);
    static sendPlayerStatus = new EmissionFilter(Events.FromServer.IS_PLAYING);
    static sendHint = new EmissionFilter(Events.FromServer.HINT);
    static sendCheatIndex = new EmissionFilter(Events.FromServer.CHEAT_INDEX);
    static sendGameValues = new EmissionFilter(Events.FromServer.GAME_VALUES);
    static sendNextCard = new EmissionFilter(Events.FromServer.NEXT_CARD);
    static sendRecord = new EmissionFilter(Events.FromServer.SPREAD_HISTORY);
    static sendTime = new EmissionFilter(Events.FromServer.TIME);
    static showFriendPendingRequest = new EmissionFilter(Events.FromServer.SHOW_PENDING_FRIEND_REQUEST);
    static startFriendRequest = new EmissionFilter(Events.FromServer.START_FRIEND_REQUEST);
    static endFriendRequest = new EmissionFilter(Events.FromServer.END_FRIEND_REQUEST);
    static userData = new EmissionFilter(Events.FromServer.USERS_DATA);
    static sendChatMessageMainPage = new EmissionFilter(Events.FromServer.CHAT_MESSAGE_MAIN_PAGE);
    static sendChannelUpdate = new EmissionFilter(Events.FromServer.CHANNEL_UPDATE);
    static sendToErrorChannel = new EmissionFilter(Events.FromServer.SOCKET_ERRORS);
    static sendInGameMessage = new EmissionFilter(Events.FromServer.IN_GAME_MESSAGE);
    static sendStartAppSignal = new EmissionFilter(Events.FromServer.START_APP);
    static sendJoinObserverInfo = new EmissionFilter(Events.FromServer.JOIN_OBSERVER);
    static sendObserverHelp = new EmissionFilter(Events.FromServer.OBSERVER_HELP);
    static sendObserverList = new EmissionFilter(Events.FromServer.OBSERVER_LIST);
    static sendUpdateGameAccessType = new EmissionFilter(Events.FromServer.UPDATE_ACCESS_TYPE);
    static sendSound = new EmissionFilter(Events.FromServer.SOUNDBOARD);
    static blockUser = new EmissionFilter(Events.FromServer.BLOCK_USER);
    static unblockUser = new EmissionFilter(Events.FromServer.UNBLOCK_USER);

    static sendLikes = new EmissionFilter(Events.FromServer.LIKES);

    @WebSocketServer() static server: Server;

    afterInit(server: Server) {
        OutputFilterGateway.server = server;
        EmissionFilter.server = server;
    }
}
