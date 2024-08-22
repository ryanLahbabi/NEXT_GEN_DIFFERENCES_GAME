import { Injectable, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TWO_DIGIT_TIME } from '@app/constants/time-constants';
import { HttpService } from '@app/services/communication/http.service';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { GifSelectionService } from '@app/services/divers/gif-selection.service';
import { SettingsService } from '@app/services/divers/settings.service';
import { UserNameCheckerService } from '@app/services/game-selection/user-name-checker.service';
import { ChannelMessageDTO } from '@common/dto/channel/channel-message.dto';
import { ChannelUpdateDTO } from '@common/dto/channel/channel-update.dto';
import { ChannelDTO } from '@common/dto/channel/channel.dto';
import { PrivateUserDataDTO } from '@common/dto/user/private-user-data.dto';
import { ChannelMessageType } from '@common/enums/channel-message-type.enum';
import { ChannelUpdateType } from '@common/enums/channel/channel-update-type.enum';
import { GameMode } from '@common/enums/game-play/game-mode';
import { GameClickOutputDto } from '@common/interfaces/game-play/game-click.dto';
import { Message, MessagesMainPage } from '@common/interfaces/game-play/message';
import { FromServer, ToServer } from '@common/socket-event-constants';
import { BehaviorSubject, Subscription } from 'rxjs';
import { GameDataService } from './game-data.service';
import { GameService } from './game.service';
import { ReplayService } from './replay.service';

interface Message1 {
    content: string;
    avatar: string;
    sentByMe: boolean;
    timestamp: number;
    sender: string;
}
@Injectable({
    providedIn: 'root',
})
export class ChatService implements OnDestroy {
    chatMode = new BehaviorSubject<'embedded' | 'detached'>('embedded');
    chatMode$ = this.chatMode.asObservable();
    messagesSource = new BehaviorSubject<MessagesMainPage[]>([]);
    messages$ = this.messagesSource.asObservable();
    gameId?: string;

    allChannels: ChannelDTO[] = [];
    conversations: { id: string; messages: MessagesMainPage[]; name: string; host?: string }[] = [];
    focusedConversationId: string = '0';
    // conversations = [{ title: 'Conversation Global', number: 1, lastMessage: 'aperçu' }];

    gaming = false;
    differenceFound: boolean;
    differenceError: boolean;
    playerGaveUp: boolean;
    valueChanged: boolean;

    isCoop: boolean = true;
    messages: Message[] = [];
    messagesMainPage: MessagesMainPage[] = [];
    inputValue: string = '';
    recordBeaterMessage: string;
    gameMode = this.gameData.gameMode;
    messageTransformed = '';
    receivedMyMessage = true;

    userData?: PrivateUserDataDTO;

    private isMessage: boolean;
    private replaySubscription: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        public socketService: SocketClientService,
        public gameData: GameDataService,
        private userNameChecker: UserNameCheckerService,
        private classicGameService: GameService,
        private replayService: ReplayService,
        private sanitizer: DomSanitizer,
        private giftSelectionService: GifSelectionService,
        private httpService: HttpService,
        private settingsService: SettingsService,
    ) {
        this.initReplayListener();
    }

    get myChannels(): ChannelDTO[] {
        return this.gaming
            ? [this.conversations.find((c) => c.id === 'gaming')!].concat(this.conversations.filter((c) => c.id !== 'gaming'))
            : this.conversations;
    }

    get otherChannels(): ChannelDTO[] {
        const joinedChannelIds = this.myChannels.map((mc) => mc.id);
        return this.allChannels.filter((c) => !joinedChannelIds.includes(c.id));
    }

    get focusedConversation(): { id: string; messages: MessagesMainPage[]; name: string; host?: string } | undefined {
        return this.conversations.find((c) => c.id === this.focusedConversationId) || this.conversations.find((c) => c.id === '0');
    }

    init(userData: PrivateUserDataDTO) {
        this.userData = userData;
        this.conversations = [];
        this.conversations.push({ id: '0', name: 'Chat General', messages: [] });
        this.socketService.on(FromServer.CHANNEL_UPDATE, (update: ChannelUpdateDTO) => {
            switch (update.type) {
                case ChannelUpdateType.INFO:
                    if (this.allChannels.length !== 0) {
                        const channel = this.allChannels.find((c) => c.id === update.channelData[0].id);
                        if (channel) channel.host = update.channelData[0].host;
                        const myChannel = this.conversations.find((c) => c.id === update.channelData[0].id);
                        if (myChannel) myChannel.host = update.channelData[0].host;
                    } else {
                        this.allChannels = update.channelData;
                        update.channelData.forEach((channel) => {
                            const inChannel = userData.channels.includes(channel.id);
                            const addChannel = inChannel && !this.conversations.find((c) => c.id === channel.id);
                            if (addChannel)
                                this.conversations.push({
                                    id: channel.id,
                                    name: channel.name || '',
                                    messages: [],
                                    host: channel.host,
                                });
                        });
                    }
                    break;
                case ChannelUpdateType.CREATE:
                    this.allChannels.push(update.channelData[0]);
                    break;
                case ChannelUpdateType.DELETE:
                    this.allChannels = this.allChannels.filter((c) => c.id !== update.channelData[0].id);
                    break;
                default:
                    break;
            }
        });

        this.socketService.send(ToServer.GET_ALL_CHANNELS);

        this.socketService.on(FromServer.HINT, () => {
            const message: Message = {
                text: 'Indice utilisé',
                time: this.getCurrentTime(),
                isMessageText: false,
                messageReceived: false,
            };
            this.pushMessage(message);
        });
        this.socketService.on(FromServer.CHAT_MESSAGE, (data: ChannelMessageDTO) => {
            this.conversations.find((c) => c.id === data.channelId)?.messages.unshift(this.filterMessage(data));
            // this.giftSelectionService.transformGifLinks();
            // localStorage.setItem('chatMessages', JSON.stringify(this.messagesMainPage));
        });

        this.socketService.on(FromServer.GLOBAL_MESSAGE, (data: string) => {
            const message: Message = {
                text: data,
                time: this.getCurrentTime(),
                isMessageText: false,
                messageReceived: false,
            };
            this.pushMessage(message);
        });

        this.socketService.on(FromServer.RECORD_BEATER, (data: string) => {
            this.recordBeaterMessage = data;
        });

        this.socketService.on(FromServer.DESERTER, (data: string) => {
            const message: Message = {
                text: data + ' a abandonné la partie',
                time: this.getCurrentTime(),
                isMessageText: false,
                messageReceived: false,
            };
            this.pushMessage(message);
        });

        this.replayService.replayEvent.subscribe(this.reset.bind(this));
    }

    addGamingChannel() {
        if (!this.gaming) {
            this.focusedConversationId = 'gaming';
            this.gaming = true;
            this.conversations.push({
                id: 'gaming',
                messages: [],
                name: 'Game Lobby',
            });
        }
    }

    removeGamingChannel() {
        if (this.gaming) {
            this.gameId = undefined;
            this.gaming = false;
            this.conversations = this.conversations.filter((c) => c.id !== 'gaming');
        }
    }

    joinChannel(channelId: string) {
        const hasAlreadyJoined = this.conversations.map((m) => m.id).includes(channelId);
        if (!hasAlreadyJoined) {
            this.httpService.joinChannel(channelId).then(() => {
                const channel = this.allChannels.find((c) => c.id === channelId);
                this.conversations.push({
                    id: channelId,
                    messages: [],
                    name: channel?.name || 'ERROR CHANNEL NOT FOUND LOCALY',
                    host: channel?.host,
                });
            });
        }
    }

    leaveChannel(channelId: string) {
        const hasJoined = this.conversations.map((m) => m.id).includes(channelId);
        if (hasJoined) {
            this.httpService.leaveChannel(channelId).then(() => {
                this.conversations = this.conversations.filter((c) => c.id !== channelId);
                if (channelId === this.focusedConversationId) this.focusedConversationId = '0';
            });
        }
    }

    async createChannel(name: string) {
        const channelId: string = (await this.httpService.createChannel(name))['channelId'];
        this.userData?.channels.push(channelId);
        this.conversations.push({
            id: channelId,
            messages: [],
            name,
            host: this.userData?.username,
        });
    }

    getMessages(conversationId: string): MessagesMainPage[] | undefined {
        return this.conversations.find((c) => c.id === conversationId)?.messages;
    }

    getFocusedMessages(): Message1[] {
        return (
            this.conversations
                .find((c) => c.id === this.focusedConversationId)
                ?.messages.map(
                    (m) =>
                        ({
                            sentByMe: m.sender === this.userData?.username,
                            content: m.message,
                            avatar: m.avatar,
                            timestamp: Number(m.timestamp),
                            sender: m.sender,
                        } as Message1),
                ) || []
        );
    }

    ngOnDestroy(): void {
        this.classicGameService.cleanup();
        if (this.replaySubscription) {
            this.replaySubscription.unsubscribe();
        }
    }

    setChatMode(mode: 'embedded' | 'detached') {
        this.chatMode.next(mode);
    }

    loadMessagesFromLocalStorage(): void {
        const storedMessages = localStorage.getItem('chatMessages');
        if (storedMessages) {
            const messages: MessagesMainPage[] = JSON.parse(storedMessages);
            this.messagesSource.next(messages);
        }
    }

    waitForEnemyClick() {
        this.socketService.on(FromServer.CLICK_ENEMY, (data: GameClickOutputDto) => {
            const message: Message = {
                text: (data.valid ? 'Différence trouvée par' : 'Erreur par') + ' ' + data.playerName,
                time: this.getCurrentTime(),
                isMessageText: false,
                messageReceived: false,
            };
            this.pushMessage(message);
        });
    }

    getGameMode() {
        if (this.gameData.gameMode === GameMode.ClassicSolo || this.gameMode === GameMode.LimitedTimeSolo) {
            this.isCoop = false;
        } else if (this.gameMode === GameMode.Classic1v1 || this.gameMode === GameMode.LimitedTimeCoop) {
            this.isCoop = true;
        }
    }

    reset() {
        this.messages = [];
    }

    setFocusedConversation(channelId: string) {
        this.focusedConversationId = channelId;
    }

    sendMessage(message: string, channelId: string = this.focusedConversationId): void {
        if (this.gaming && channelId === 'gaming' && this.gameId) {
            const messageData: { gameId: string; message: string; isAGif: boolean; timestamp: number } = {
                gameId: this.gameId!,
                message,
                isAGif: false,
                timestamp: Date.now(),
            };
            this.socketService.send(ToServer.GAME_CHAT_MESSAGE, messageData);
        } else {
            const messageDto = {
                message,
                channelId,
                isAGIF: false,
                timestamp: Date.now(),
            };
            this.socketService.send(ToServer.SEND_CHAT_MESSAGE, messageDto);
        }
        // }
    }

    onKeyDown(event: Event): void {
        if (this.gameMode === GameMode.LimitedTimeCoop || this.gameMode === GameMode.Classic1v1) {
            if (event instanceof KeyboardEvent && event.key === 'Enter') {
                this.isMessage = true;
                this.addMessage();
            }
        }
    }
    differenceFounded() {
        if (this.differenceFound) {
            if (this.gameMode === GameMode.ClassicSolo || this.gameMode === GameMode.LimitedTimeSolo) {
                this.inputValue = 'Différence trouvée';
            } else {
                this.inputValue = `Différence trouvée par ${this.gameData.name}`;
            }
            this.addMessage();
        }
    }

    differenceMistakeMade() {
        if (this.differenceError) {
            if (this.gameMode === GameMode.ClassicSolo || this.gameMode === GameMode.LimitedTimeSolo) {
                this.inputValue = 'Erreur';
            } else {
                this.inputValue = `Erreur par ${this.gameData.name}`;
            }
            this.addMessage();
        }
    }

    onFocus() {
        this.classicGameService.canCheat = false;
    }

    onFocusOut() {
        this.classicGameService.canCheat = true;
    }

    pushMessage(message: Message) {
        if (this.replayService.isReplayMode) this.replayService.store('pushMessage', message);
        this.messages.unshift(message);
    }

    filterMessage(messageDto: ChannelMessageDTO): MessagesMainPage {
        let message: string | SafeHtml = 'Error no message';
        let messageReceived = true;
        let sender = 'ERROR UNDEFINED SENDER';
        switch (messageDto.type) {
            case ChannelMessageType.UserMessage:
                if (!messageDto.sender) break;
                message = messageDto.message!;
                sender = messageDto.sender;
                if (messageDto.sender === this.userData?.username) this.receivedMyMessage = true;
                break;
            case ChannelMessageType.GlobalAction: {
                if (!messageDto.getGlobalMessage || !this.userData) break;
                message = messageDto.getGlobalMessage[this.settingsService.language];
                messageReceived = false;
                sender = 'GLOBAL MESSAGE';
                break;
            }
            case ChannelMessageType.GifUri:
                if (!messageDto.sender) break;
                if (messageDto.message!.includes('<img')) message = this.sanitizer.bypassSecurityTrustHtml(messageDto.message!);
                else message = this.giftSelectionService.transformGifLinks(messageDto.message!);
                sender = messageDto.sender;
                break;
            default:
                break;
        }

        const messageObj: MessagesMainPage = {
            avatar: messageDto.avatar || 'avatar_placeholder',
            message,
            timestamp: messageDto.timestamp.toString(),
            messageReceived,
            sender,
            lobbyId: messageDto.channelId,
        };
        return messageObj;
    }

    private initReplayListener() {
        this.replaySubscription = this.replayService.replayActionTrigger.subscribe((action) => {
            switch (action.category) {
                case 'pushMessage':
                    this.pushMessage(action.input as Message);
                    break;
            }
        });
    }

    private addMessage() {
        if (this.gaming && this.userNameChecker.isValidInput(this.inputValue)) {
            const messageData: { gameId: string; message: string; isAGif: boolean; timestamp: number } = {
                gameId: this.gameData.gameID,
                message: this.inputValue,
                isAGif: false,
                timestamp: Date.now(),
            };

            if (this.isMessage && this.inputValue.length >= 1) {
                this.socketService.send(ToServer.GAME_CHAT_MESSAGE, messageData);
            }

            this.inputValue = '';
            this.isMessage = false;
        }
    }

    private getCurrentTime(): string {
        const now = new Date();
        const hours = this.formatTime(now.getHours());
        const minutes = this.formatTime(now.getMinutes());
        const seconds = this.formatTime(now.getSeconds());
        return `${hours}:${minutes}:${seconds}`;
    }

    private formatTime(time: number): string {
        return time < TWO_DIGIT_TIME ? `0${time}` : `${time}`;
    }
}
