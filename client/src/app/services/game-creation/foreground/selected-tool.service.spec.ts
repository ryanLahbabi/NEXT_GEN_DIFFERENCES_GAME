import { TestBed } from '@angular/core/testing';

import { SelectedToolService } from './selected-tool.service';

describe('SelectedToolService', () => {
    let service: SelectedToolService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SelectedToolService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
