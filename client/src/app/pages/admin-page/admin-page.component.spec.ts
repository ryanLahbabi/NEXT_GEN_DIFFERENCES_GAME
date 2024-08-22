// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable max-classes-per-file */
// import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
// import { Router, RouterState } from '@angular/router';
// import { WarningDialogComponent } from '@app/components/config-selection/warning-dialog/warning-dialog.component';
// import { AccountService } from '@app/services/account/account.service';
// import { SocketClientService } from '@app/services/communication/socket-client.service';
// import { GameListManagerService } from '@app/services/divers/game-list-manager.service';
// import { GameSelectorService } from '@app/services/game-selection/game-selector.service';
// import { CarouselType } from '@common/enums/carousel-type';
// import { Subject } from 'rxjs';
// import { AdminPageComponent } from './admin-page.component';
// import SpyObj = jasmine.SpyObj;

// @Component({ selector: 'app-top-bar', template: '' })
// class TopBarStubComponent {
//     @Input() pageTitle: string;
// }

// @Component({ selector: 'app-carousel-view', template: '' })
// class CarouselViewStubComponent {
//     @Input() buttonNames: [string, string, string] = ['', '', ''];
// }

// describe('AdminPageComponent', () => {
//     let fakeObservable: Subject<boolean>;
//     let fixture: ComponentFixture<AdminPageComponent>;
//     let socketSpy: SpyObj<SocketClientService>;
//     let gameListSpy: SpyObj<GameListManagerService>;
//     let dialogSpy: SpyObj<MatDialog>;
//     let selectorSpy: SpyObj<GameSelectorService>;
//     let fakeSelectionValue: Subject<{ buttonName: string; id: string }>;
//     let dialogRefSpy: SpyObj<MatDialogRef<WarningDialogComponent>>;
//     let accountServiceSpy: SpyObj<AccountService>;
//     let routerSpy: SpyObj<Router>;
//     let routerStateSpy: SpyObj<RouterState>;

//     beforeEach(async () => {
//         fakeObservable = new Subject<boolean>();
//         dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
//         fakeSelectionValue = new Subject<{ buttonName: string; id: string }>();
//         socketSpy = jasmine.createSpyObj('SocketClientService', ['connect', 'send']);
//         gameListSpy = jasmine.createSpyObj('GameListManagerService', ['deleteGame', 'deleteAllGames', 'resetBestTimes', 'resetAllBestTimes']);
//         dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
//         selectorSpy = jasmine.createSpyObj('GameSelectorService', ['setSelectionValue'], { selectionValue: fakeSelectionValue });
//         accountServiceSpy = jasmine.createSpyObj('AccountService', { isLoggedIn: true });
//         routerStateSpy = jasmine.createSpyObj('RouterState', {}, ['root']);
//         routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl'], { routerState: routerStateSpy });
//         await TestBed.configureTestingModule({
//             imports: [MatDialogModule],
//             declarations: [CarouselViewStubComponent, AdminPageComponent, TopBarStubComponent],
//             providers: [
//                 { provide: SocketClientService, useValue: socketSpy },
//                 { provide: GameListManagerService, useValue: gameListSpy },
//                 { provide: MatDialog, useValue: dialogSpy },
//                 { provide: GameSelectorService, useValue: selectorSpy },
//                 { provide: AccountService, useValue: accountServiceSpy },
//                 { provide: Router, useValue: routerSpy },
//             ],
//             schemas: [CUSTOM_ELEMENTS_SCHEMA],
//         }).compileComponents();
//         fixture = TestBed.createComponent(AdminPageComponent);
//         selectorSpy.setSelectionValue.and.callFake((carouselType: CarouselType, id: string) => {
//             selectorSpy.selectionValue.next({ carouselType, id });
//         });
//         dialogRefSpy.afterClosed.and.callFake(() => {
//             return fakeObservable;
//         });
//         fixture.detectChanges();
//     });
//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });
//     // it('should subscribe clickhandler to selectorService`s selectionValue on init', () => {
//     //     spyOn<any>(component, 'clickHandler');
//     //     component.ngOnInit();
//     //     selectorSpy.setSelectionValue(component.adminCarouselType, 'fakeId');
//     //     expect(component['clickHandler']).toHaveBeenCalled();
//     // });
//     // it('should unsubscribe clickhandler to selectorService`s selectionValue on destroy', () => {
//     //     spyOn<any>(component, 'clickHandler');
//     //     component.ngOnInit();
//     //     component.ngOnDestroy();
//     //     selectorSpy.setSelectionValue(component.adminCarouselType, 'fakeId');
//     //     expect(component['clickHandler']).not.toHaveBeenCalled();
//     // });
//     // it('should warn player when deleting a game', () => {
//     //     component.warnPlayer = jasmine.createSpy('warnPlayer').and.returnValue(dialogRefSpy);
//     //     component['deleteGame']('fakeId');
//     //     expect(component.warnPlayer).toHaveBeenCalledWith('supprimer ce jeu');
//     // });
//     // it('should warn player when deleting all games', () => {
//     //     component.warnPlayer = jasmine.createSpy('warnPlayer').and.returnValue(dialogRefSpy);
//     //     component.deleteAllGames();
//     //     expect(component.warnPlayer).toHaveBeenCalledWith('supprimer tous les jeux');
//     // });
//     // it('should open a warning dialog when warning player', () => {
//     //     component.warnPlayer('fakeAction');
//     //     expect(dialogSpy.open.calls.mostRecent().args[0]).toEqual(WarningDialogComponent);
//     // });
//     // it('should complete game`s deletion when user confirmes his choice', () => {
//     //     component.warnPlayer = jasmine.createSpy('warnPlayer').and.returnValue(dialogRefSpy);
//     //     component['deleteGame']('fakeId');
//     //     fakeObservable.next(true);
//     //     expect(gameListSpy.deleteGame).toHaveBeenCalledWith('fakeId');
//     // });
// });
