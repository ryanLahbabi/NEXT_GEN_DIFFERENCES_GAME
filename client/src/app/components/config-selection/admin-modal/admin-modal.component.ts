import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpService } from '@app/services/communication/http.service';
import { catchError, throwError } from 'rxjs';

@Component({
    selector: 'app-admin-modal',
    templateUrl: './admin-modal.component.html',
    styleUrls: ['./admin-modal.component.scss'],
})
export class AdminModalComponent {
    errorMessage = '';

    constructor(public dialogRef: MatDialogRef<AdminModalComponent>, private router: Router, private httpService: HttpService) {
        dialogRef.disableClose = true;
    }

    submitPassword(password: string) {
        this.errorMessage = '';
        this.httpService
            .postAdmin(password)
            .pipe(catchError(this.handleError.bind(this)))
            .subscribe(() => {
                this.dialogRef.close();
                this.router.navigateByUrl('/admin');
            });
    }

    closeDialog() {
        this.dialogRef.close();
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.Forbidden) {
            this.errorMessage = 'Le mot de passe est erroné.';
        } else {
            this.errorMessage = "Une erreur s'est produite. Veuillez réessayer.";
        }
        return throwError(() => new Error(error.error.message));
    }
}
