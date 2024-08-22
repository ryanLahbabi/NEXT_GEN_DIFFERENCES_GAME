import { TestBed } from '@angular/core/testing';

import { UserNameCheckerService } from './user-name-checker.service';

describe('UserNameCheckerService', () => {
    let service: UserNameCheckerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UserNameCheckerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return false on empty input', () => {
        expect(service.isValidInput('')).toBeFalse();
    });

    it('should return false on invalid input', () => {
        expect(service.isValidInput('       ')).toBeFalse();
    });

    it('should return true on valid input', () => {
        expect(service.isValidInput('Hi')).toBeTrue();
    });
});
