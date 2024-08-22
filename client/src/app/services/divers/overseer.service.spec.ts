// import { TestBed } from '@angular/core/testing';

// import { AccountService } from '@app/services/account/account.service';
// import { HistoryService } from '@app/services/game-config/history.service';
// import { OngoingGameService } from '@app/services/game-config/ongoing-game.service';
// import { ChatService } from '@app/services/game-play/chat.service';
// import { GameTimeService } from '@app/services/game-play/game-time.service';
// import { GameService } from '@app/services/game-play/game.service';
// import { GameListManagerService } from './game-list-manager.service';
// import { OverseerService } from './overseer.service';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import SpyObj = jasmine.SpyObj;

// describe('OverseerService', () => {
//     let service: OverseerService;
//     let gameListSpy: SpyObj<GameListManagerService>;
//     let historyServiceSpy: SpyObj<HistoryService>;
//     let chatServiceSpy: SpyObj<ChatService>;
//     let gameTimeServiceSpy: SpyObj<GameTimeService>;
//     let gameServiceSpy: SpyObj<GameService>;
//     let accountServiceSpy: SpyObj<AccountService>;
//     let ongoingGameServiceSpy: SpyObj<OngoingGameService>;

//     beforeEach(() => {
//         gameListSpy = jasmine.createSpyObj('GameListManagerService', ['init'], { initialized: false });
//         historyServiceSpy = jasmine.createSpyObj('HistoryService', ['init'], { initialized: false });
//         chatServiceSpy = jasmine.createSpyObj('ChatService', ['init'], { initialized: false });
//         gameTimeServiceSpy = jasmine.createSpyObj('GameTimeService', ['init'], { initialized: false });
//         gameServiceSpy = jasmine.createSpyObj('GameService', ['init'], { initialized: false });
//         ongoingGameServiceSpy = jasmine.createSpyObj('OngoingGameService', ['init'], { initialized: false });
//         accountServiceSpy = jasmine.createSpyObj('GameService', { hasBeenLoggedOut: false });
//         TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule],
//             providers: [
//                 { provide: GameListManagerService, useValue: gameListSpy },
//                 { provide: HistoryService, useValue: historyServiceSpy },
//                 { provide: ChatService, useValue: chatServiceSpy },
//                 { provide: GameTimeService, useValue: gameTimeServiceSpy },
//                 { provide: GameService, useValue: gameServiceSpy },
//                 { provide: AccountService, useValue: accountServiceSpy },
//                 { provide: OngoingGameService, useValue: ongoingGameServiceSpy },
//             ],
//         });
//         service = TestBed.inject(OverseerService);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });
// });
