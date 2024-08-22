/* eslint-disable */

import { HttpClient, HttpHandler } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ChildrenOutletContexts, UrlSerializer } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { FriendsService } from './friends.service';

describe('FriendsService', () => {
    let service: FriendsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            providers: [HttpClient, HttpHandler, UrlSerializer, ChildrenOutletContexts],
        });
        service = TestBed.inject(FriendsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
