import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
})
export class LoadingComponent {
    constructor(public dialogRef: MatDialogRef<LoadingComponent>) {
        dialogRef.disableClose = true;
    }
}
