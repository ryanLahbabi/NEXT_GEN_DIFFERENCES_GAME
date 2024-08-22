import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ERROR_VISIBILITY_TIME } from '@app/constants/account-constants';
import { AccountService } from '@app/services/account/account.service';
import { HttpService } from '@app/services/communication/http.service';
import { AvatarService } from '@app/services/divers/avatar.service';

@Component({
    selector: 'app-edit-profile-page',
    templateUrl: './edit-profile-page.component.html',
    styleUrls: ['./edit-profile-page.component.scss'],
})
export class EditProfilePageComponent implements OnInit {
    @ViewChild('imageInput') imageInput: ElementRef;

    biography = '';
    avatar = '';
    username = '';
    errorMessage: string;
    private lastErrorTime: number;

    constructor(
        readonly accountService: AccountService,
        private readonly httpService: HttpService,
        private readonly router: Router,
        private readonly avatarService: AvatarService,
    ) {}

    get carouselImages() {
        return this.avatarService.carouselImages;
    }

    ngOnInit(): void {
        if (this.accountService.currentUser) {
            this.biography = this.accountService.currentUser?.biography;
            this.username = this.accountService.currentUser?.username;
            this.avatar = this.accountService.currentUser?.avatar;
        }
    }

    chooseAvatar(image: string) {
        this.avatar = image;
    }

    async tryChangingUsername() {
        return new Promise<string | undefined>((resolve, reject) => {
            if (this.username === '') {
                reject(undefined);
            } else if (this.username === this.accountService.currentUser?.username) {
                resolve(undefined);
            } else {
                this.httpService.putUsername(
                    this.username,
                    (newUsername: string, newToken: string) => {
                        this.accountService.currentUser!.username = newUsername;
                        resolve(newToken);
                    },
                    (error: string) => {
                        reject(error);
                    },
                );
            }
        });
    }

    async onSubmit() {
        this.tryChangingUsername()
            .then(async (newToken) => {
                const updatedUsername = newToken !== undefined;
                let modified = updatedUsername;
                if (updatedUsername) this.httpService.init(() => newToken);

                const p1 = this.httpService.putAvatar(this.avatar);
                p1.then(() => {
                    this.accountService.currentUser!.avatar = this.avatar;
                    modified = true;
                });
                const p2 = this.httpService.putBiography(this.biography);
                p2.then(() => {
                    this.accountService.currentUser!.biography = this.biography;
                    modified = true;
                });
                await Promise.all([p1, p2]);
                if (modified) this.accountService.saveUserData();
                if (updatedUsername) this.accountService.updateToken(newToken);
                this.router.navigateByUrl('/account');
            })
            .catch((error: string) => {
                if (error === 'USERNAME_IN_USE') {
                    this.showError('ERROR_USERNAME_NOT_UNIQUE');
                } else {
                    this.showError('ERROR_USERNAME');
                }
            });
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
                this.avatar = '';
            }
        };
        reader.readAsDataURL(file);
        this.imageInput.nativeElement.value = null;
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
