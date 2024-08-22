import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpService } from './http.service';
import SpyObj = jasmine.SpyObj;

describe('HttpService', () => {
    let service: HttpService;
    let httpClientSpy: SpyObj<HttpClient>;

    beforeEach(() => {
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['post', 'get']);
        TestBed.configureTestingModule({
            providers: [{ provide: HttpClient, useValue: httpClientSpy }],
        });
        service = TestBed.inject(HttpService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
