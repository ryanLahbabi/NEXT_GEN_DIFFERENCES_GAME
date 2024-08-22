import { AfterViewInit, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserNameCheckerService } from '@app/services/game-selection/user-name-checker.service';

@Component({
    selector: 'app-user-name-dialog',
    templateUrl: './user-name-dialog.component.html',
    styleUrls: ['./user-name-dialog.component.scss'],
})
export class UserNameDialogComponent implements AfterViewInit {
    constructor(public dialogRef: MatDialogRef<UserNameDialogComponent>, private userNameChecker: UserNameCheckerService) {}

    ngAfterViewInit(): void {
        const confirmButton = document.querySelector('#confirm button') as Element;
        confirmButton.setAttribute('disabled', '');
        confirmButton.classList.add('disabled');
    }

    closeDialog(username: string | undefined) {
        this.dialogRef.close(username);
    }

    onChange(inputValue: string) {
        const inputElement = document.querySelector('#userInput');
        const confirmButton = document.querySelector('#confirm button');
        if (inputElement && confirmButton) {
            if (this.userNameChecker.isValidInput(inputValue)) {
                inputElement.classList.remove('error');
                confirmButton.removeAttribute('disabled');
                confirmButton.classList.remove('disabled');
            } else {
                inputElement.classList.add('error');
                confirmButton.classList.add('disabled');
                confirmButton.setAttribute('disabled', '');
            }
        }
    }
}
