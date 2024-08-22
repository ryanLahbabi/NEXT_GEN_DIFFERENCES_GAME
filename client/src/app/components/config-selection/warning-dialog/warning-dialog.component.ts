import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-warning-dialog',
    templateUrl: './warning-dialog.component.html',
    styleUrls: ['./warning-dialog.component.scss'],
})
export class WarningDialogComponent {
    constructor(public dialogRef: MatDialogRef<WarningDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: string) {}

    closeDialog(choice: boolean) {
        this.dialogRef.close(choice);
    }
}
