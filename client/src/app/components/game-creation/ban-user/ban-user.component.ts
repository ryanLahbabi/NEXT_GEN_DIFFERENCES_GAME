import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-ban-user',
    templateUrl: './ban-user.component.html',
    styleUrls: ['./ban-user.component.scss'],
})
export class BanUserComponent {
    constructor(private dialogRef: MatDialogRef<BanUserComponent>) {}

    closePopup(): void {
        this.dialogRef.close();
    }
}
