import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-warn-player-modal',
    templateUrl: './warn-player-modal.component.html',
    styleUrls: ['./warn-player-modal.component.scss'],
})
export class WarnPlayerModalComponent implements OnDestroy, OnInit {
    static opened = false;
    constructor(
        public dialogRef: MatDialogRef<WarnPlayerModalComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { warning: number },
    ) {}
    ngOnDestroy(): void {
        WarnPlayerModalComponent.opened = false;
    }
    ngOnInit(): void {
        WarnPlayerModalComponent.opened = true;
    }
    closeDialog() {
        this.dialogRef.close();
    }
}
