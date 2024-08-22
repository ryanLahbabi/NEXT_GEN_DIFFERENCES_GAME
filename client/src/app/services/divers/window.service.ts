import { Injectable } from '@angular/core';
import { INTERVAL_TIME } from '@app/constants/time-constants';
import { ChatService } from '@app/services/game-play/chat.service';

@Injectable({
    providedIn: 'root',
})
export class WindowService {
    private chatWindowRef: Window | null = null;

    constructor(private chatService: ChatService) {}

    openChatInNewWindow() {
        const chatWindowUrl = `${location.origin}/#/window-chat`;
        this.chatWindowRef = window.open(chatWindowUrl, '_blank', 'width=1100,height=1020');

        if (this.chatWindowRef) {
            this.chatService.setChatMode('detached');
            const interval = setInterval(() => {
                if (this.chatWindowRef?.closed) {
                    clearInterval(interval);
                    this.chatService.setChatMode('embedded');
                    this.chatWindowRef = null;
                } else {
                    if (this.chatWindowRef) {
                        this.chatWindowRef.postMessage('updateMessages', location.origin);
                    }
                }
            }, INTERVAL_TIME);
        }
    }

    onUserLogout(): void {
        this.chatService.messagesMainPage = [];
        localStorage.removeItem('chatMessages');
    }

    closeDetachedChatWindow() {
        if (this.chatWindowRef) {
            this.chatWindowRef.close();
            this.chatWindowRef = null;
            this.chatService.setChatMode('embedded');
        }
    }

    closeWindow() {
        if (typeof window !== 'undefined') {
            window.close();
            this.chatWindowRef = null;
            this.chatService.setChatMode('embedded');
        }
    }
}
