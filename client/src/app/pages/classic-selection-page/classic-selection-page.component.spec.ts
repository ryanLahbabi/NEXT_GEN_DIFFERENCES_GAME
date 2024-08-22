// /* eslint-disable max-lines */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable max-classes-per-file */
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
// import { Router } from '@angular/router';
// import { RouterTestingModule } from '@angular/router/testing';
// import { Game } from '@app/classes/game-play/game';
// import { SocketTestHelper } from '@app/classes/test-helpers/socket-test-helper';
// import { UserNameDialogComponent } from '@app/components/config-selection/user-name-dialog/user-name-dialog.component';
// import { GameSelection } from '@app/interfaces/game-card/game-selection';
// import { AccountService } from '@app/services/account/account.service';
// import { SocketClientService } from '@app/services/communication/socket-client.service';
// import { FriendsService } from '@app/services/friends/friends.service';
// import { ObserverService } from '@app/services/game-config/observer.service';
// import { GameDataService } from '@app/services/game-play/game-data.service';
// import { GameSelectorService } from '@app/services/game-selection/game-selector.service';
// import { CarouselType } from '@common/enums/carousel-type';
// import { Subject } from 'rxjs';
// import { ClassicSelectionPageComponent } from './classic-selection-page.component';
// import SpyObj = jasmine.SpyObj;

// @Component({ selector: 'app-carousel-view', template: '' })
// class CarouselViewStubComponent {
//     @Input() games: Game[] = [];
//     @Input() buttonNames: [string, string, string];
// }
// @Component({ selector: 'app-tabs', template: '' })
// class TabsStubComponent {
//     @Input() name: string;
//     @Input() active = false;
// }
// @Component({ selector: 'app-tab', template: '' })
// class TabStubComponent {
//     @Input() name: string;
//     @Input() active = false;
// }

// class MockFriendsService {
//     getFriends() {
//         return [{ name: 'Mock Friend', id: '1' }];
//     }
// }

// describe('ClassicSelectionPageComponent', () => {
//     let fakeObservable: Subject<string | undefined>;
//     let dialogRefSpy: SpyObj<MatDialogRef<UserNameDialogComponent>>;
//     let fixture: ComponentFixture<ClassicSelectionPageComponent>;
//     let dialogSpy: SpyObj<MatDialog>;
//     let routerSpy: SpyObj<Router>;
//     let selectorSpy: SpyObj<GameSelectorService>;
//     let socketSpy: SocketTestHelper;
//     let fakeSelectionValue: Subject<{ carouselType: CarouselType; id: string }>;
//     let accountServiceSpy: SpyObj<AccountService>;
//     let ongoingGameServiceSpy: SpyObj<ObserverService>;

//     beforeEach(async () => {
//         fakeObservable = new Subject<string | undefined>();
//         dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
//         fakeSelectionValue = new Subject<GameSelection>();
//         socketSpy = new SocketTestHelper();
//         dialogSpy = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
//         routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
//         selectorSpy = jasmine.createSpyObj('GameSelectorService', ['setSelectionValue'], { selectionValue: fakeSelectionValue });
//         accountServiceSpy = jasmine.createSpyObj('AccountService', { isLoggedIn: true });
//         ongoingGameServiceSpy = jasmine.createSpyObj('OngoingGameService', ['joinGame']);
//         await TestBed.configureTestingModule({
//             imports: [MatDialogModule, RouterTestingModule, HttpClientTestingModule],
//             declarations: [ClassicSelectionPageComponent, CarouselViewStubComponent, TabsStubComponent, TabStubComponent],
//             providers: [
//                 GameDataService,
//                 { provide: MatDialog, useValue: dialogSpy },
//                 { provide: SocketClientService, useValue: socketSpy },
//                 { provide: Router, useValue: routerSpy },
//                 { provide: GameSelectorService, useValue: selectorSpy },
//                 { provide: AccountService, useValue: accountServiceSpy },
//                 { provide: FriendsService, useClass: MockFriendsService },
//                 { provide: ObserverService, useValue: ongoingGameServiceSpy },
//             ],
//             schemas: [NO_ERRORS_SCHEMA],
//         }).compileComponents();
//         fixture = TestBed.createComponent(ClassicSelectionPageComponent);
//         selectorSpy.setSelectionValue.and.callFake((carouselType: CarouselType, id: string) => {
//             selectorSpy.selectionValue.next({ carouselType, id });
//         });
//         dialogSpy.open.and.returnValue(dialogRefSpy);
//         dialogRefSpy.afterClosed.and.returnValue(fakeObservable.asObservable());
//         fixture.detectChanges();
//     });

// });
