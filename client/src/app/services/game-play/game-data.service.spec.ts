import { TestBed } from '@angular/core/testing';
import { GameDataService } from './game-data.service';

describe('PassGameDataService', () => {
    let service: GameDataService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameDataService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
