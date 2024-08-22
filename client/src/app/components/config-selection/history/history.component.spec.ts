/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormatTimePipe } from '@app/classes/pipes/format-time.pipe';
import { WarningDialogComponent } from '@app/components/config-selection/warning-dialog/warning-dialog.component';
import { PostItComponent } from '@app/components/general/post-it/post-it.component';
import { DIALOG_CUSTOM_CONFIG } from '@app/constants/dialog-config';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { ToServer } from '@common/socket-event-constants';
import { Subject } from 'rxjs';
import { HistoryComponent } from './history.component';
import SpyObj = jasmine.SpyObj;

describe('HistoryComponent', () => {
    let funcSpy: jasmine.Spy;
    let fakeObservable: Subject<boolean>;
    let dialogSpy: SpyObj<MatDialog>;
    let component: HistoryComponent;
    let fixture: ComponentFixture<HistoryComponent>;
    let historyDialogRefSpy: SpyObj<MatDialogRef<HistoryComponent>>;
    let warnDialogRefSpy: SpyObj<MatDialogRef<WarningDialogComponent>>;
    let socketSpy: SpyObj<SocketClientService>;

    beforeEach(async () => {
        fakeObservable = new Subject<boolean>();
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        historyDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        warnDialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        socketSpy = jasmine.createSpyObj('SocketClientService', ['on', 'send', 'removeListener']);

        await TestBed.configureTestingModule({
            declarations: [HistoryComponent, WarningDialogComponent, FormatTimePipe, PostItComponent],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: MatDialogRef<HistoryComponent>, useValue: historyDialogRefSpy },
                { provide: SocketClientService, useValue: socketSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(HistoryComponent);
        component = fixture.componentInstance;
        funcSpy = spyOn(component, 'warnUser' as never);
        funcSpy.and.returnValue(warnDialogRefSpy);
        warnDialogRefSpy.afterClosed.and.callFake(() => {
            return fakeObservable;
        });
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should warn user when reseting history', () => {
        component.resetHistory();
        expect(funcSpy).toHaveBeenCalled();
    });
    it('should open a warning dialog when warning player', () => {
        funcSpy.and.callThrough();
        component['warnUser']();
        const dialogConfig = Object.assign({}, DIALOG_CUSTOM_CONFIG);
        dialogConfig.data = 'supprimer l`historique des parties jouées';
        expect(dialogSpy.open).toHaveBeenCalledWith(WarningDialogComponent, dialogConfig);
    });
    it('should complete games history deletion when user confirmes his choice', () => {
        component.resetHistory();
        fakeObservable.next(true);
        expect(component.resetHistory).toBeTruthy();
        expect(socketSpy.send).toHaveBeenCalledWith(ToServer.DELETE_ALL_RECORDS);
    });

    it('should close dialog', () => {
        component.closeDialog();
        expect(historyDialogRefSpy.close).toHaveBeenCalled();
    });
    it('should close dialog', () => {
        component.closeDialog();
        expect(historyDialogRefSpy.close).toHaveBeenCalled();
    });
});
