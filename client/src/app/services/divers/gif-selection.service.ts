import { Injectable } from '@angular/core';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { ToServer } from '@common/socket-event-constants';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GifSelectionService {
    selectedGifSource = new BehaviorSubject<string | null>(null);
    selectedGif$ = this.selectedGifSource.asObservable();
    messageWithGif: string;

    constructor(private socketClientService: SocketClientService) {}

    selectGif(url: string, id: string) {
        const messageDto = {
            message: url,
            isAGif: true,
            channelId: id,
            timestamp: Date.now(),
        };
        this.socketClientService.send(ToServer.SEND_CHAT_MESSAGE, messageDto);
    }

    transformGifLinks(message: string): string {
        const urlRegex = /(https?:\/\/\S+\.gif)(\S*(&ct=g)?)?/g;
        return message.replace(urlRegex, '<img class="gif-image" src="$1" alt="GIF" />');
    }
}
