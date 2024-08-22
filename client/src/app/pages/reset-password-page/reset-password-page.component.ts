import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '@app/services/account/account.service';
import { HttpService } from '@app/services/communication/http.service';

@Component({
    selector: 'app-reset-password-page',
    templateUrl: './reset-password-page.component.html',
    styleUrls: ['./reset-password-page.component.scss'],
})
export class ResetPasswordPageComponent implements OnInit {
    username: string;
    password: string;
    email: string;
    code: string;
    errorMessage: string;
    isValidEmail = false;
    isValidCode = false;
    confirmPassword: string = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    codeInput: any;
    verificationCode: string = '';
    passwordNotMatch = false;
    isValidCodeWarning = false;
    isUser = '';

    // private lastErrorTime: number;

    constructor(private readonly accountService: AccountService, private httpService: HttpService, private readonly router: Router) {}

    ngOnInit(): void {
        if (this.accountService.isLoggedIn) {
            this.router.navigateByUrl('/home');
        }
    }
    generateRandomCode(): string {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return Math.floor(10000 + Math.random() * 90000).toString();
    }

    onSubmitEmail() {
        if (this.email) {
            this.isValidEmail = true;
            this.verificationCode = this.generateRandomCode();
            this.httpService.sendEmail(this.email, this.verificationCode).then();
        }
    }
    onSubmitCode() {
        if (this.code === this.verificationCode) {
            this.isValidCode = true;
        } else {
            this.isValidCodeWarning = true;
        }
    }
    onSubmitPassword() {
        const passwordPattern = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).+$/;
        this.passwordNotMatch = false;
        if (this.password !== this.confirmPassword) {
            this.passwordNotMatch = true;
            this.errorMessage = 'RESET_MATCH';
        } else if (!passwordPattern.test(this.password)) {
            this.passwordNotMatch = true;
            this.errorMessage = 'SIGNUP_ERRORPASSWORD';
        } else {
            this.isValidCode = true;
            this.httpService.sendComfirmation(this.email);
            this.updatePassword();
            this.router.navigate(['/login']);
        }
    }
    updatePassword() {
        // eslint-disable-next-line deprecation/deprecation
        this.httpService.updatePassword(this.email, this.password).subscribe();
    }
}
