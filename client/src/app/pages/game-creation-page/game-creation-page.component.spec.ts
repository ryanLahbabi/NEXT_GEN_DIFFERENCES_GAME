// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable max-classes-per-file */
// import { Component, Input } from '@angular/core';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatDialog } from '@angular/material/dialog';
// import { Router } from '@angular/router';
// import { SocketTestHelper } from '@app/classes/test-helpers/socket-test-helper';
// import { AccountService } from '@app/services/account/account.service';
// import { SocketClientService } from '@app/services/communication/socket-client.service';
// import { GameListManagerService } from '@app/services/divers/game-list-manager.service';
// import { ImageFileService } from '@app/services/divers/image-file.service';
// import { GameCreationBackgroundService } from '@app/services/game-creation/background/game-creation-background.service';
// import { DrawService } from '@app/services/game-creation/foreground/draw.service';
// import { ForegroundDataService } from '@app/services/game-creation/foreground/foreground-data.service';
// import { ImageIndex } from '@common/enums/game-creation/image-index';
// import { GameCreationPageComponent } from './game-creation-page.component';
// import SpyObj = jasmine.SpyObj;

// @Component({ selector: 'app-tool-bar', template: '' })
// class ToolBarStubComponent {}

// @Component({ selector: 'app-top-bar', template: '' })
// class TopBarStubComponent {
//     @Input() pageTitle: string;
// }

// @Component({ selector: 'app-image-edition-zone', template: '' })
// class ImageEditionZoneStubComponent {
//     @Input() imageIndex: ImageIndex;
// }

// @Component({ selector: 'app-game-creation-dialog', template: '' })
// class GameCreationDialogStubComponent {}

// @Component({ selector: 'app-paper-button', template: '' })
// class PaperButtonStubComponent {
//     @Input() onClick: () => void;
// }

// describe('GameCreationPageComponent', () => {
//     let component: GameCreationPageComponent;
//     let fixture: ComponentFixture<GameCreationPageComponent>;
//     let dialogSpy: SpyObj<MatDialog>;
//     let routerSpy: SpyObj<Router>;
//     let socketHelper: SocketTestHelper;
//     let imageFileServiceSpy: SpyObj<ImageFileService>;
//     let gameCreationBackgroundServiceSpy: SpyObj<GameCreationBackgroundService>;
//     let foregroundDataServiceSpy: SpyObj<ForegroundDataService>;
//     let drawServiceSpy: SpyObj<DrawService>;
//     let gameListManagerServiceSpy: SpyObj<GameListManagerService>;
//     let accountServiceSpy: SpyObj<AccountService>;

//     beforeEach(async () => {
//         const observableSpy = jasmine.createSpyObj('Observable', ['subscribe']);
//         const dialogRefSpy = jasmine.createSpyObj('MatDialog', ['afterClosed']);
//         dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
//         dialogRefSpy.afterClosed.and.returnValue(observableSpy);
//         dialogSpy.open.and.returnValue(dialogRefSpy);
//         routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
//         socketHelper = new SocketTestHelper();
//         imageFileServiceSpy = jasmine.createSpyObj('ImageFileService', ['urlToBuffer', 'loadImage']);
//         gameCreationBackgroundServiceSpy = jasmine.createSpyObj('GameCreationBackgroundService', ['clearImage', 'getImageUrl']);
//         foregroundDataServiceSpy = jasmine.createSpyObj('ForegroundDataService', ['reset', 'changeState'], {
//             foregroundData: { original: 'original', modified: 'modified' },
//         });
//         drawServiceSpy = jasmine.createSpyObj('DrawService', ['clearCanvas', 'drawImage']);
//         accountServiceSpy = jasmine.createSpyObj('AccountService', { isLoggedIn: true });
//         await TestBed.configureTestingModule({
//             declarations: [
//                 GameCreationPageComponent,
//                 TopBarStubComponent,
//                 PaperButtonStubComponent,
//                 ImageEditionZoneStubComponent,
//                 GameCreationDialogStubComponent,
//                 ToolBarStubComponent,
//             ],
//             providers: [
//                 { provide: MatDialog, useValue: dialogSpy },
//                 { provide: Router, useValue: routerSpy },
//                 { provide: SocketClientService, useValue: socketHelper },
//                 { provide: ImageFileService, useValue: imageFileServiceSpy },
//                 { provide: GameCreationBackgroundService, useValue: gameCreationBackgroundServiceSpy },
//                 { provide: ForegroundDataService, useValue: foregroundDataServiceSpy },
//                 { provide: DrawService, useValue: drawServiceSpy },
//                 { provide: GameListManagerService, useValue: gameListManagerServiceSpy },
//                 { provide: AccountService, useValue: accountServiceSpy },
//             ],
//         }).compileComponents();

//         fixture = TestBed.createComponent(GameCreationPageComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     // it('openCreationDialog should open dialog if there is a valid number of diffrences', () => {
//     //     component['openCreationDialog']({ valid: true, differenceNbr: 5, difficulty: 0, differenceImage: '' });
//     //     expect(dialogSpy.open).toHaveBeenCalled();
//     // });

//     // it("should assign difficulty 'facile' for difficulty code 0", () => {
//     //     expect(['easy', 'facile']).toContain(component['getDifficulty'](0))
//     // });

//     // it("should assign difficulty 'difficile' for difficulty code 1", () => {
//     //     expect(component['getDifficulty'](1)).toEqual('difficile');
//     // });

//     it("should assign difficulty 'facile' for unknown difficulty code", () => {
//         expect(component['getDifficulty'](2)).toEqual('facile');
//         expect(['easy', 'facile']).toContain(component['getDifficulty'](2));

//     });

// });
