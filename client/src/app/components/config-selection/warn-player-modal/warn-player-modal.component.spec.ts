import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PaperButtonComponent } from '@app/components/general/paper-button/paper-button.component';
import { WarnPlayerModalComponent } from './warn-player-modal.component';

describe('WarnPlayerModalComponent', () => {
    let component: WarnPlayerModalComponent;
    let fixture: ComponentFixture<WarnPlayerModalComponent>;
    let dialogRefSpy: jasmine.SpyObj<MatDialogRef<WarnPlayerModalComponent>>;
    let dialogSpy: MatDialog;

    beforeEach(async () => {
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
        dialogSpy = jasmine.createSpyObj('MatDialog', ['closeAll']);
        const warning = 0;
        await TestBed.configureTestingModule({
            declarations: [WarnPlayerModalComponent, PaperButtonComponent],
            providers: [
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: MAT_DIALOG_DATA, useValue: warning },
                { provide: MatDialog, useValue: dialogSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WarnPlayerModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('should close dialog', () => {
        component.closeDialog();
        expect(dialogRefSpy.close).toHaveBeenCalled();
    });
});
