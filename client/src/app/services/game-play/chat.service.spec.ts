/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { TestBed } from '@angular/core/testing';
// import { SocketClientService } from '@app/services/communication/socket-client.service';
// import { UserNameCheckerService } from '@app/services/game-selection/user-name-checker.service';
// import { ChatService } from './chat.service';
// import { GameDataService } from './game-data.service';
// import { GameService } from './game.service';
// import SpyObj = jasmine.SpyObj;
// import { HttpClient } from '@angular/common/http';
// import { HttpClientModule } from '@angular/common/http';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { SocketTestHelper } from '@app/classes/test-helpers/socket-test-helper';
// import { GameMode } from '@common/enums/game-play/game-mode';
// import { Hint } from '@common/interfaces/difference-locator-algorithm/hint';
// import { GameClickOutputDto } from '@common/interfaces/game-play/game-click.dto';
// import { Message } from '@common/interfaces/game-play/message';
// import { Coordinates } from '@common/interfaces/general/coordinates';
// import { FromServer, ToServer } from '@common/socket-event-constants';
// import { ReplayService } from './replay.service';

// describe('ChatService', () => {
//     const fakeHint = {
//         start: {
//             x: 0,
//             y: 0,
//         } as Coordinates,
//         end: {
//             x: 0,
//             y: 0,
//         } as Coordinates,
//     } as Hint;
//     let service: ChatService;
//     let socketService: SocketTestHelper;
//     let passGameData: GameDataService;
//     let userNameChecker: UserNameCheckerService;
//     let gameService: GameService;
//     let replayServiceSpy: SpyObj<ReplayService>;
//     beforeEach(() => {
//         socketService = new SocketTestHelper();
//         passGameData = jasmine.createSpyObj('GameDataService', [], {
//             gameMode: GameMode.Classic1v1,
//             gameID: '123',
//             name: 'John',
//         });
//         userNameChecker = jasmine.createSpyObj('UserNameCheckerService', ['isValidInput']);
//         gameService = jasmine.createSpyObj('GameService', [], { canCheat: true });
//         const replayEventSpy = jasmine.createSpyObj('EventEmitter', ['subscribe']);
//         replayServiceSpy = jasmine.createSpyObj('ReplayService', ['reset', 'store', 'doAndStore', 'endOfReplay'], {
//             isReplayMode: false,
//             replayEvent: replayEventSpy,
//         });

//         TestBed.configureTestingModule({
//             imports: [HttpClientModule, HttpClientTestingModule, RouterTestingModule],
//             providers: [
//                 { provide: SocketClientService, useValue: socketService },
//                 { provide: GameDataService, useValue: passGameData },
//                 { provide: UserNameCheckerService, useValue: userNameChecker },
//                 { provide: GameService, useValue: gameService },
//                 { provide: ReplayService, useValue: replayServiceSpy },
//                 // Pas besoin d'ajouter HttpClient ici, car il sera disponible via HttpClientModule
//             ],
//         });

//         service = TestBed.inject(ChatService);
//         service.init();
//     });

//     it('should call socketService.on for hint, chat_message, global_message, and deserter', () => {
//         expect(socketService['callbacks'].has(FromServer.HINT.name)).toBeTruthy();
//         expect(socketService['callbacks'].has(FromServer.CHAT_MESSAGE.name)).toBeTruthy();
//         expect(socketService['callbacks'].has(FromServer.GLOBAL_MESSAGE.name)).toBeTruthy();
//         expect(socketService['callbacks'].has(FromServer.DESERTER.name)).toBeTruthy();
//     });

//     it('should receive a hint message from the socket service', () => {
//         spyOn<any>(service, 'getCurrentTime').and.returnValue('2023-04-15T10:00:00.000Z');
//         const message: Message = {
//             text: 'Indice utilisé',
//             time: '2023-04-15T10:00:00.000Z',
//             isMessageText: false,
//             messageReceived: false,
//         };

//         socketService.peerSideEmit(FromServer.HINT, fakeHint);
//         expect(service.messages).toContain(message);
//     });

//     it('should set recordBeaterMessage when receiving record_beater event', () => {
//         socketService.peerSideEmit(FromServer.RECORD_BEATER, 'John');
//         expect(service.recordBeaterMessage).toEqual('John');
//     });

//     it('should add global message to messages when receiving global_message event', () => {
//         spyOn<any>(service, 'getCurrentTime').and.returnValue('2023-04-15T10:00:00.000Z');
//         const text = ' - ';
//         const message: Message = {
//             text,
//             time: '2023-04-15T10:00:00.000Z',
//             isMessageText: false,
//             messageReceived: false,
//         };

//         socketService.peerSideEmit(FromServer.GLOBAL_MESSAGE, text);
//         expect(service.messages.pop()).toEqual(message);
//     });

//     it('should call push message when deserter event is received', () => {
//         socketService.peerSideEmit(FromServer.DESERTER, 'Joshua');
//         expect(service.messages.pop()?.text).toEqual('Joshua a abandonné la partie');
//     });

//     describe('waitForEnemyClick', () => {
//         it('should add a difference found message when "click_enemy" event is received with valid data', () => {
//             const playerName = 'Ryan';
//             const messageText = `Différence trouvée par ${playerName}`;
//             const getCurrentTimeSpy = spyOn<any>(service, 'getCurrentTime').and.returnValue('2023-04-15T10:00:00.000Z');
//             spyOn(service, 'pushMessage');

//             const data = {
//                 valid: true,
//                 playerName: 'Ryan',
//                 penaltyTime: 0,
//                 differenceNaturalOverlay: '',
//                 differenceFlashOverlay: '',
//             } as GameClickOutputDto;

//             service.waitForEnemyClick();
//             socketService.peerSideEmit(FromServer.CLICK_ENEMY, data);
//             expect(service.pushMessage).toHaveBeenCalledWith({
//                 text: messageText,
//                 time: '2023-04-15T10:00:00.000Z',
//                 isMessageText: false,
//                 messageReceived: false,
//             });
//             expect(getCurrentTimeSpy).toHaveBeenCalled();
//         });
//         it('should add an error message when "click_enemy" event is received with invalid data', () => {
//             const playerName = 'Ryan';
//             const messageText = `Erreur par ${playerName}`;
//             const getCurrentTimeSpy = spyOn<any>(service, 'getCurrentTime').and.returnValue('2023-04-15T10:00:00.000Z');
//             spyOn(service, 'pushMessage');

//             const data = {
//                 valid: false,
//                 playerName: 'Ryan',
//                 penaltyTime: 0,
//                 differenceNaturalOverlay: '',
//                 differenceFlashOverlay: '',
//             } as GameClickOutputDto;

//             service.waitForEnemyClick();
//             socketService.peerSideEmit(FromServer.CLICK_ENEMY, data);
//             expect(service.pushMessage).toHaveBeenCalledWith({
//                 text: messageText,
//                 time: '2023-04-15T10:00:00.000Z',
//                 isMessageText: false,
//                 messageReceived: false,
//             });
//             expect(getCurrentTimeSpy).toHaveBeenCalled();
//         });
//     });

//     describe('reset()', () => {
//         it('should clear the messages array', () => {
//             service.messages = [
//                 {
//                     text: 'mockMessage',
//                     time: '12:34:56',
//                     isMessageText: false,
//                     messageReceived: false,
//                 },
//                 { text: 'mockMessage', time: '12:34:56', isMessageText: false, messageReceived: false },
//             ];

//             service.reset();

//             expect(service.messages.length).toEqual(0);
//         });
//     });
//     it('should call addMessage when Enter key is pressed in LimitedTimeCoop or Classic1v1 game mode', () => {
//         const event = new KeyboardEvent('keydown', { key: 'Enter' });
//         const gameMode = GameMode.LimitedTimeCoop;
//         const inputValue = 'test message';
//         const isMessage = true;
//         spyOn<any>(service, 'addMessage');

//         service.gameMode = gameMode;
//         service.inputValue = inputValue;
//         service['isMessage'] = isMessage;
//         service.onKeyDown(event);

//         expect(service['addMessage']).toHaveBeenCalledWith(true);
//     });
//     it('should not call addMessage if not in multiplayer game', () => {
//         const event = new KeyboardEvent('keydown', { key: 'Enter' });
//         const gameMode1 = GameMode.LimitedTimeSolo;
//         const gameMode2 = GameMode.ClassicSolo;
//         const inputValue = 'test message';
//         const isMessage = true;
//         spyOn<any>(service, 'addMessage');

//         service.gameMode = gameMode1;
//         service.inputValue = inputValue;
//         service['isMessage'] = isMessage;
//         service.onKeyDown(event);

//         expect(service['addMessage']).not.toHaveBeenCalled();

//         service.gameMode = gameMode2;
//         service.onKeyDown(event);
//         expect(service['addMessage']).not.toHaveBeenCalled();
//     });

//     it('should add a message to the list of messages when input is valid', () => {
//         const validInput = 'VOUS: Hello, world!';
//         (userNameChecker.isValidInput as jasmine.Spy).and.returnValue(true);
//         service.inputValue = validInput;
//         service['addMessage'](true);
//         const expectedMessage: Message = {
//             text: validInput,
//             time: '12:34:56',
//             isMessageText: false,
//             messageReceived: false,
//         };
//         expect(service.messages[0].text).toContain(expectedMessage.text);
//         expect(service.messages[0].messageReceived).toEqual(expectedMessage.messageReceived);
//     });

//     it('should send a chat message to the server if isMessage is true', () => {
//         spyOn(socketService, 'send');
//         const validInput = 'Hello, world!';
//         (userNameChecker.isValidInput as jasmine.Spy).and.returnValue(true);
//         service.inputValue = validInput;
//         service['isMessage'] = true;
//         service['addMessage'](false);
//         expect(socketService.send).toHaveBeenCalledWith(ToServer.GAME_CHAT_MESSAGE, { gameId: '123', message: validInput });
//     });
//     describe('pushMessage()', () => {
//         it('should add the given message to the beginning of the messages array', () => {
//             const message: Message = {
//                 text: 'Test message',
//                 time: '12:34:56',
//                 isMessageText: true,
//                 messageReceived: true,
//             };
//             const originalMessages = [...service.messages];

//             service.pushMessage(message);

//             expect(service.messages.length).toEqual(originalMessages.length + 1);
//             expect(service.messages[0]).toEqual(message);
//             expect(service.messages.slice(1)).toEqual(originalMessages);
//         });
//     });

//     describe('onFocus() and onFocusOut()', () => {
//         it('should set gameService.canCheat to false on focus', () => {
//             service.onFocus();

//             gameService = jasmine.createSpyObj('GameService', [], { canCheat: false });

//             expect(gameService.canCheat).toBeFalse();
//         });

//         it('should set gameService.canCheat to true on focus out', () => {
//             service.onFocusOut();

//             expect(gameService.canCheat).toBeTrue();
//         });
//     });

//     describe('differenceFounded()', () => {
//         it('should set inputValue to "Différence trouvée" if differenceFound is true and gameMode is ClassicSolo', () => {
//             service.gameMode = GameMode.ClassicSolo;
//             service.differenceFound = true;

//             service.differenceFounded();

//             expect(service.inputValue).toBe('Différence trouvée');
//         });

//         it('should set inputValue to "Différence trouvée" if differenceFound is true and gameMode is LimitedTimeSolo', () => {
//             service.gameMode = GameMode.LimitedTimeSolo;
//             service.differenceFound = true;

//             service.differenceFounded();

//             expect(service.inputValue).toBe('Différence trouvée');
//         });

//         // eslint-disable-next-line max-len
//         it('should set inputValue to "Différence trouvée par [name]" if differenceFound is true and gameMode is not ClassicSolo or LimitedTimeSolo', () => {
//             service.gameMode = GameMode.Classic1v1;
//             service.differenceFound = true;
//             service.gameData.name = 'John';

//             service.differenceFounded();

//             expect(service.inputValue).toBe('Différence trouvée par John');
//         });

//         it('should not set inputValue if differenceFound is false', () => {
//             service.gameMode = GameMode.ClassicSolo;
//             service.differenceFound = false;

//             service.differenceFounded();

//             expect(service.inputValue).toBe('');
//         });
//     });

//     describe('getCurrentTime', () => {
//         it('should return the current time in format "hh:mm:ss"', () => {
//             const mockNow = new Date(2022, 3, 14, 15, 30, 45);
//             service['getCurrentTime'] = () => {
//                 const hours = service['formatTime'](mockNow.getHours());
//                 const minutes = service['formatTime'](mockNow.getMinutes());
//                 const seconds = service['formatTime'](mockNow.getSeconds());
//                 return `${hours}:${minutes}:${seconds}`;
//             };

//             const result = service['getCurrentTime']();

//             expect(result).toEqual('15:30:45');
//         });
//     });

//     it('should add a new message to the chat', () => {
//         spyOn(socketService, 'send');
//         service['addMessage'](false);
//         expect(socketService.send).not.toHaveBeenCalled();
//         expect(service.inputValue).toEqual('');
//         expect(service['isMessage']).toBeFalsy();
//     });
//     describe('differenceMistakeMade()', () => {
//         it('should set inputValue to "Erreur" if differenceError is true and gameMode is ClassicSolo', () => {
//             service.gameMode = GameMode.ClassicSolo;
//             service.differenceError = true;

//             service.differenceMistakeMade();

//             expect(service.inputValue).toBe('Erreur');
//         });

//         it('should set inputValue to "Erreur" if differenceError is true and gameMode is LimitedTimeCoop', () => {
//             service.gameMode = GameMode.LimitedTimeCoop;
//             service.differenceError = true;

//             service.differenceMistakeMade();

//             expect(service.inputValue).toBe('Erreur par John');
//         });

//         it('should set inputValue to "Erreur par [name]" if differenceError is true and gameMode is Classic1v1', () => {
//             service.gameMode = GameMode.Classic1v1;
//             service.differenceError = true;

//             service.differenceMistakeMade();

//             expect(service.inputValue).toBe('Erreur par John');
//         });

//         it('should not set inputValue if differenceError is false', () => {
//             service.gameMode = GameMode.ClassicSolo;
//             service.differenceError = false;

//             service.differenceMistakeMade();

//             expect(service.inputValue).toBe('');
//         });
//     });
//     it('should set isCoop to false if gameMode is ClassicSolo or LimitedTimeSolo', () => {
//         service.gameMode = GameMode.ClassicSolo;
//         service.getGameMode();
//         expect(service.isCoop).toBeTrue();

//         service.gameMode = GameMode.LimitedTimeSolo;
//         service.getGameMode();
//         expect(service.isCoop).toBeFalse();
//     });

//     it('should set isCoop to true if gameMode is Classic1v1 or LimitedTimeCoop', () => {
//         service.gameMode = GameMode.Classic1v1;
//         service.getGameMode();
//         expect(service.isCoop).toBeTrue();

//         service.gameMode = GameMode.LimitedTimeCoop;
//         service.getGameMode();
//         expect(service.isCoop).toBeTrue();
//     });

//     it('should return a string with leading zero if the input is less than 10', () => {
//         expect(service['formatTime'](9)).toEqual('09');
//         expect(service['formatTime'](1)).toEqual('01');
//         expect(service['formatTime'](0)).toEqual('00');
//     });

//     it('should return a string without leading zero if the input is greater or equal to 10', () => {
//         expect(service['formatTime'](10)).toEqual('10');
//         expect(service['formatTime'](11)).toEqual('11');
//         expect(service['formatTime'](20)).toEqual('20');
//     });

//     it('should initialize replay listener for reset', () => {
//         expect(replayServiceSpy.replayEvent.subscribe).toHaveBeenCalledWith(jasmine.any(Function));
//     });
// });
