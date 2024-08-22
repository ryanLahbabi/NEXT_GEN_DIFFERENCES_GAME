import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserName } from '@app/classes/game-play/user-name';
import { PaperButtonComponent } from '@app/components/general/paper-button/paper-button.component';
import { UserNameCheckerService } from '@app/services/game-selection/user-name-checker.service';
import { UserNameDialogComponent } from './user-name-dialog.component';
import SpyObj = jasmine.SpyObj;

describe('UserNameDialogComponent', () => {
    let component: UserNameDialogComponent;
    let fixture: ComponentFixture<UserNameDialogComponent>;
    let dialogRefSpy: SpyObj<MatDialogRef<UserNameDialogComponent>>;
    let checkerSpy: SpyObj<UserNameCheckerService>;
    let testElement: HTMLDivElement;

    beforeEach(async () => {
        dialogRefSpy = jasmine.createSpyObj('dialogSpy', ['close']);
        checkerSpy = jasmine.createSpyObj('checkerSpy', ['isValidInput']);
        await TestBed.configureTestingModule({
            declarations: [UserNameDialogComponent, PaperButtonComponent],
            providers: [
                { provide: MatDialog, useValue: {} },
                { provide: MatDialogRef, useValue: dialogRefSpy },
                { provide: UserNameCheckerService, useValue: checkerSpy },
                { provide: MAT_DIALOG_DATA, useValue: () => void {} },
                UserName,
            ],
        }).compileComponents();
        testElement = document.createElement('div');
        fixture = TestBed.createComponent(UserNameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should disable confirm button after view init', () => {
        document.querySelector = jasmine.createSpy().and.returnValue(testElement);
        spyOn(testElement, 'setAttribute');
        component.ngAfterViewInit();
        expect(testElement.setAttribute).toHaveBeenCalledWith('disabled', '');
    });

    it('should close dialog and return the user`s input', () => {
        component.closeDialog(undefined);
        expect(dialogRefSpy.close).toHaveBeenCalledWith(undefined);
        component.closeDialog('test');
        expect(dialogRefSpy.close).toHaveBeenCalledWith('test');
    });
    it('should call UserNameChecker`s isValidInput method in onChange', () => {
        document.querySelector = jasmine.createSpy().and.returnValue(testElement);
        component.onChange('test');
        expect(checkerSpy.isValidInput).toHaveBeenCalled();
    });
    it('should remove error class from input element on valid input', () => {
        document.querySelector = jasmine.createSpy().and.returnValue(testElement);
        checkerSpy.isValidInput.and.returnValue(true);
        spyOn(testElement.classList, 'remove');
        component.onChange('test');
        expect(testElement.classList.remove).toHaveBeenCalledWith('error');
    });

    it('should enable confirm button on valid input', () => {
        document.querySelector = jasmine.createSpy().and.returnValue(testElement);
        checkerSpy.isValidInput.and.returnValue(true);
        spyOn(testElement, 'removeAttribute');
        component.onChange('test');
        expect(testElement.removeAttribute).toHaveBeenCalledWith('disabled');
    });

    it('should add error class to input element on invalid input', () => {
        document.querySelector = jasmine.createSpy().and.returnValue(testElement);
        checkerSpy.isValidInput.and.returnValue(false);
        spyOn(testElement.classList, 'add');
        component.onChange('test');
        expect(testElement.classList.add).toHaveBeenCalledWith('error');
    });

    it('should disable confirm button on invalid input', () => {
        document.querySelector = jasmine.createSpy().and.returnValue(testElement);
        checkerSpy.isValidInput.and.returnValue(false);
        spyOn(testElement, 'setAttribute');
        component.onChange('test');
        expect(testElement.setAttribute).toHaveBeenCalledWith('disabled', '');
    });
});
