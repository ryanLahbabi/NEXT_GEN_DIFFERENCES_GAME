// /* eslint-disable max-classes-per-file */
// import { Component, Input, Pipe, PipeTransform } from '@angular/core';
// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { GameCreationDialogComponent } from './game-creation-dialog.component';
// import SpyObj = jasmine.SpyObj;

// @Component({ selector: 'app-paper-button', template: '' })
// class PaperButtonStubComponent {
//     @Input() onClick: () => void;
// }

// @Pipe({ name: 'safeResourceUrl' })
// class SafeUrlStubPipe implements PipeTransform {
//     transform() {
//         return '';
//     }
// }

// describe('GameCreationDialogComponent', () => {
//     let component: GameCreationDialogComponent;
//     let fixture: ComponentFixture<GameCreationDialogComponent>;
//     let dialogRefSpy: SpyObj<MatDialogRef<GameCreationDialogComponent>>;

//     beforeEach(async () => {
//         dialogRefSpy = jasmine.createSpyObj('dialogSpy', ['close']);
//         await TestBed.configureTestingModule({
//             declarations: [GameCreationDialogComponent, PaperButtonStubComponent, SafeUrlStubPipe],
//             providers: [
//                 { provide: MatDialog, useValue: {} },
//                 { provide: MatDialogRef, useValue: dialogRefSpy },
//                 { provide: MAT_DIALOG_DATA, useValue: {} },
//             ],
//         }).compileComponents();

//         fixture = TestBed.createComponent(GameCreationDialogComponent);
//         component = fixture.componentInstance;
//         fixture.detectChanges();
//     });

//     it('should create', () => {
//         expect(component).toBeTruthy();
//     });

// it('should close the dialog via cancel method', () => {
//     component.cancel();
//     expect(dialogRefSpy.close).toHaveBeenCalled();
// });

// it('should return the name via confirm method', () => {
//     const name = 'test';
//     component.confirm(name);
//     expect(dialogRefSpy.close).toHaveBeenCalledWith(name);
// });

// it('should not close the dialog via confirm method if no name has been inputted', () => {
//     spyOn(window, 'alert');
//     const name = '';
//     component.confirm(name);
//     expect(dialogRefSpy.close).not.toHaveBeenCalled();
// });
// });
