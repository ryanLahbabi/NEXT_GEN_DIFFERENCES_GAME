import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WarningDialogComponent } from '@app/components/config-selection/warning-dialog/warning-dialog.component';
import { DIALOG_CUSTOM_CONFIG } from '@app/constants/dialog-config';
import { HistoryService } from '@app/services/game-config/history.service';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
})
export class HistoryComponent {
    constructor(public historyService: HistoryService, public dialogRef: MatDialogRef<HistoryComponent>, public dialog: MatDialog) {}

    resetHistory() {
        const warningDialogRef = this.warnUser();
        warningDialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) this.historyService.resetHistory();
        });
    }

    closeDialog() {
        this.dialogRef.close();
    }

    private warnUser() {
        const dialogConfig = Object.assign({}, DIALOG_CUSTOM_CONFIG);
        dialogConfig.data = 'supprimer l`historique des parties jouées';
        return this.dialog.open(WarningDialogComponent, dialogConfig);
    }
}
