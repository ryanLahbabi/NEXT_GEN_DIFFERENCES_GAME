/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/ban-types */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SocketTestHelper } from '@app/classes/test-helpers/socket-test-helper';
import { WarningDialogComponent } from '@app/components/config-selection/warning-dialog/warning-dialog.component';
import { DIALOG_CUSTOM_CONFIG } from '@app/constants/dialog-config';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { GameValues } from '@common/interfaces/game-play/game-values';
import * as Events from '@common/socket-event-constants';
import { ToServer } from '@common/socket-event-constants';

import { of, Subject } from 'rxjs';
import { GameConstantsComponent } from './game-constants.component';
import SpyObj = jasmine.SpyObj;

describe('GameConstantsComponent', () => {
    let funcSpy: jasmine.Spy;
    let fakeObservable: Subject<boolean>;
    let component: GameConstantsComponent;
    let fixture: ComponentFixture<GameConstantsComponent>;
    let dialogSpy: SpyObj<MatDialog>;
    let warnDialogRefSpy: SpyObj<MatDialogRef<WarningDialogComponent>>;
    let socketService: SocketTestHelper;

    beforeEach(async () => {
        fakeObservable = new Subject<boolean>();
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        warnDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        socketService = new SocketTestHelper();

        await TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [GameConstantsComponent],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: MatDialogRef, useValue: { close, confirm } },
                { provide: MAT_DIALOG_DATA, useValue: { confirm } },
                { provide: SocketClientService, useValue: socketService },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(GameConstantsComponent);
        component = fixture.componentInstance;
        funcSpy = spyOn(component, 'warnUser' as never);
        fixture.detectChanges();

        funcSpy.and.returnValue(warnDialogRefSpy);
        warnDialogRefSpy.afterClosed.and.callFake(() => {
            return fakeObservable;
        });
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get game values from server', () => {
        spyOn(socketService, 'on');
        spyOn(socketService, 'send');
        component.ngOnInit();

        expect(socketService.send).toHaveBeenCalledWith(ToServer.GET_GAME_VALUES);
        expect(socketService['callbacks'].has(Events.FromServer.GAME_VALUES.name)).toBeTruthy();
    });

    it('should close dialog when closed', () => {
        spyOn(component.dialogRef, 'close');
        component.closeDialog();
        expect(component.dialogRef.close).toHaveBeenCalled();
    });
    it('should open a warning dialog when warning player', () => {
        funcSpy.and.callThrough();
        component['warnUser']();
        const dialogConfig = Object.assign({}, DIALOG_CUSTOM_CONFIG);
        dialogConfig.data = 'modifier les constantes de jeu';
        expect(dialogSpy.open).toHaveBeenCalledWith(WarningDialogComponent, dialogConfig);
    });

    it('should reset to default values', () => {
        component.resetDefaultValues();
        expect(component.currentTimerTime).toEqual(30);
        expect(component.currentPenaltyTime).toEqual(5);
        expect(component.currentGainedTime).toEqual(5);
    });

    it('should call the warnBadValue method', () => {
        component.warnBadValue('5', '10', '15');
        expect(component.isInRange).toBeTrue();

        component.warnBadValue('130', '0', '-5');
        expect(component.isInRange).toBeFalse();
    });

    it('should send game values to server and close dialog when user confirms', () => {
        const timer = '40';
        const penalty = '2';
        const gained = '10';
        const constants = {
            timerTime: 40,
            penaltyTime: 2,
            gainedTime: 10,
        } as GameValues;
        spyOn(component.socketService, 'send');
        spyOn(component, 'closeDialog');
        funcSpy.and.returnValue(warnDialogRefSpy);
        warnDialogRefSpy.afterClosed.and.returnValue(of(true));
        component.confirm(timer, penalty, gained);
        expect(component.socketService.send).toHaveBeenCalledWith(ToServer.SET_GAME_VALUES, constants);
        expect(component.closeDialog).toHaveBeenCalled();
        expect(component.isInRange).toBeTrue();
    });
});
