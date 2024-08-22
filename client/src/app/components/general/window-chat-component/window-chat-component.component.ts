import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WindowService } from '@app/services/divers/window.service';
import { ChatService } from '@app/services/game-play/chat.service';
import { MessagesMainPage } from '@common/interfaces/game-play/message';

@Component({
    selector: 'app-window-chat-component',
    templateUrl: './window-chat-component.component.html',
    styleUrls: ['./window-chat-component.component.scss'],
})
export class WindowChatComponent implements OnInit {
    showGifComponent: boolean = false;

    constructor(public chatService: ChatService, public windowService: WindowService, private sanitizer: DomSanitizer) {}

    ngOnInit(): void {
        this.chatService.messages$.subscribe((messages: MessagesMainPage[]) => {
            this.chatService.messagesMainPage = messages;
        });

        this.chatService.loadMessagesFromLocalStorage();
    }

    getGifImage(gifUrl: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(gifUrl);
    }

    toggleGifComponent(): void {
        this.showGifComponent = !this.showGifComponent;
    }
}
