/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GifSelectionService } from '@app/services/divers/gif-selection.service';
import { ChatService } from '@app/services/game-play/chat.service';
import { BehaviorSubject, Subscription } from 'rxjs';

const GIF_TOKEN = '2hrYZpXsFvTv1EPYYz8sdKKWvmaAITPL';

export interface SearchVal {
    searchText: string;
    reset: boolean;
}

@Component({
    selector: 'app-gif',
    templateUrl: './gif.component.html',
    styleUrls: ['./gif.component.scss'],
})
export class GifComponent implements OnInit {
    @Output() closeThis = new EventEmitter<void>();
    gifs: any[] = [];
    loading: boolean = false;
    mode: 'stickers' | 'gifs' = 'gifs';
    gif = new BehaviorSubject<any>([]);
    subscription: Subscription;
    text: string = '';

    constructor(private gifSelectionService: GifSelectionService, private http: HttpClient, private chatService: ChatService) {}

    ngOnInit(): void {
        this.getTrendingGifs();
        this.getGifs().subscribe((response: any) => {
            this.gifs = response;
        });
    }

    changeView() {
        this.closeThis.emit();
    }

    getTrendingGifs() {
        return this.http.get(`https://api.giphy.com/v1/gifs/trending?api_key=${GIF_TOKEN}&limit=50}`).subscribe((response: any) => {
            this.gif.next(response.data);
        });
    }

    setGifs(gifs: any[]): void {
        this.gifs = gifs;
    }

    onKeyDown(event: any) {
        event.preventDefault();
    }

    search(searchTerm: any) {
        if (searchTerm !== '') {
            this.searchGifs();
        }
        this.text = '';
    }

    getGifs() {
        return this.gif.asObservable();
    }

    selectGif(gif: any): void {
        const gifUrl = gif.images.original.url;
        this.gifSelectionService.selectGif(gifUrl, this.chatService.focusedConversationId);
        this.changeView();
    }

    private searchGifs() {
        return this.http.get(`https://api.giphy.com/v1/gifs/search?q=${this.text}&api_key=${GIF_TOKEN}&limit=50}`).subscribe((response: any) => {
            this.gif.next(response.data);
        });
    }
}
