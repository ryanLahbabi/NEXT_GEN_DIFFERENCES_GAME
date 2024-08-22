import { TestBed } from '@angular/core/testing';
import { Router, RouterState } from '@angular/router';
import { HttpService } from '@app/services/communication/http.service';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { Observable } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('AccountService', () => {
    let httpServiceSpy: SpyObj<HttpService>;
    let socketServiceSpy: SpyObj<SocketClientService>;
    let routerSpy: SpyObj<Router>;
    let routerStateSpy: SpyObj<RouterState>;

    beforeEach(() => {
        httpServiceSpy = jasmine.createSpyObj('HttpService', ['getUserMe']);
        httpServiceSpy.getUserMe.and.returnValue(new Observable());
        routerStateSpy = jasmine.createSpyObj('RouterState', {}, ['root']);
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl'], { routerState: routerStateSpy });
        socketServiceSpy = jasmine.createSpyObj('SocketClientService', ['connect', 'disconnect']);
        TestBed.configureTestingModule({
            providers: [
                { provide: HttpService, useValue: httpServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: SocketClientService, useValue: socketServiceSpy },
            ],
        });
    });

    it('should be created', () => {
        expect(true).toBeTruthy();
    });
});
