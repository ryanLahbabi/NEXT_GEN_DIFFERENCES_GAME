import { Injectable } from '@angular/core';
import { USERNAME_MIN_LENGTH } from '@app/constants/game-selection-constants';

@Injectable({
    providedIn: 'root',
})
export class UserNameCheckerService {
    isValidInput(value: string): boolean {
        return this.testLength(value) && this.testSpaces(value);
    }

    private testLength(value: string): boolean {
        return value.length >= USERNAME_MIN_LENGTH;
    }

    private testSpaces(value: string): boolean {
        return /\S/.test(value);
    }
}
