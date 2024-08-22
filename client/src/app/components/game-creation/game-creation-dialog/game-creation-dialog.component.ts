import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/images-constants';

@Component({
    selector: 'app-game-creation-dialog',
    templateUrl: './game-creation-dialog.component.html',
    styleUrls: ['./game-creation-dialog.component.scss'],
})
export class GameCreationDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<GameCreationDialogComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: {
            valid: boolean;
            nbDifferences: number;
            differenceImage: string;
            difficulty: string;
        },
    ) {}

    get imgWidth(): number {
        return DEFAULT_WIDTH;
    }

    get imgHeight(): number {
        return DEFAULT_HEIGHT;
    }

    confirm(name: string) {
        if (name) {
            this.dialogRef.close(name);
        } else {
            alert('Veuillez donner un nom au jeu.');
        }
    }

    cancel() {
        this.dialogRef.close();
    }
}
