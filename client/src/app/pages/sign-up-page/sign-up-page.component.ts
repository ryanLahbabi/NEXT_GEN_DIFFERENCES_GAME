import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ERROR_VISIBILITY_TIME } from '@app/constants/account-constants';
import { AccountService } from '@app/services/account/account.service';
import { HttpService } from '@app/services/communication/http.service';
import { AvatarService } from '@app/services/divers/avatar.service';
import { catchError, throwError } from 'rxjs';

@Component({
    selector: 'app-sign-up-page',
    templateUrl: './sign-up-page.component.html',
    styleUrls: ['./sign-up-page.component.scss'],
})
export class SignUpPageComponent implements OnInit {
    @ViewChild('imageInput') imageInput: ElementRef;

    username: string;
    password: string;
    email: string;
    errorMessage: string;
    avatar = 'avatar_placeholder';
    private lastErrorTime: number;

    constructor(
        private readonly accountService: AccountService,
        private readonly httpService: HttpService,
        private readonly router: Router,
        private readonly avatarService: AvatarService,
    ) {}

    get carouselImages() {
        return this.avatarService.carouselImages;
    }

    ngOnInit(): void {
        if (this.accountService.isLoggedIn) {
            this.router.navigateByUrl('/home');
        }
    }

    chooseAvatar(image: string) {
        this.avatar = image;
    }

    clickOnImageInput(): void {
        this.imageInput.nativeElement.click();
    }

    updateImageUrl() {
        const file = this.imageInput.nativeElement.files[0];
        const reader = new FileReader();
        reader.onload = async () => {
            if (typeof reader.result === 'string') {
                this.avatar = await this.avatarService.crop(reader.result);
            } else {
                this.avatar = 'avatar_placeholder';
            }
        };
        reader.readAsDataURL(file);
        this.imageInput.nativeElement.value = null;
    }

    async onSubmit(): Promise<void> {
        this.httpService
            .postSignup(this.username, this.email, this.password, this.avatar)
            .pipe(catchError(this.handleError.bind(this)))
            .subscribe((response) => {
                this.accountService.login(response.accessToken);
            });
    }

    private handleError(error: HttpErrorResponse) {
        switch (error.error.name) {
            case 'USERNAME_IN_USE':
                this.showError('ERROR_USERNAME_NOT_UNIQUE');
                break;
            case 'EMAIL_IN_USE':
                this.showError('ERROR_EMAIL_IN_USE');
                break;
            default:
                this.showError('ERROR_GENERAL');
        }
        return throwError(() => new Error(error.error.message));
    }

    private async showError(message: string): Promise<void> {
        this.errorMessage = message;
        const startingTime = Date.now();
        this.lastErrorTime = startingTime;
        await new Promise((resolve) => {
            setTimeout(resolve, ERROR_VISIBILITY_TIME);
        });
        if (startingTime === this.lastErrorTime) {
            this.errorMessage = '';
        }
    }
}
