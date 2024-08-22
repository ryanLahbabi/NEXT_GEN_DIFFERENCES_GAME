import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AvatarService } from '@app/services/divers/avatar.service';
import { ChatService } from '@app/services/game-play/chat.service';

interface Message {
    sender: string;
    content: string;
    avatar: string;
    sentByMe: boolean;
    timestamp: number;
}

@Component({
    selector: 'app-channel-conversation',
    templateUrl: './channel-conversation.component.html',
    styleUrls: ['./channel-conversation.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ChannelConversationComponent implements OnInit {
    @Input() lone: boolean = false;
    @ViewChild('test') private messageContainerElementRef: ElementRef;
    gifView = false;
    messages: Message[] = [];
    messageText = '';
    messagesLen = 0;

    constructor(private channelService: ChatService, private readonly avatarService: AvatarService) {}

    get isAtBottom() {
        return true;
    }

    get channelName() {
        return this.channelService.focusedConversation?.name;
    }

    get channelHost() {
        return this.channelService.focusedConversation?.host;
    }

    ngOnInit(): void {
        const timeout = 5;
        setTimeout(() => {
            this.scrollToBottom();
            this.updateSeachFieldSize();
        }, timeout);
    }

    closeGif() {
        this.gifView = false;
    }
    openGif() {
        this.gifView = true;
    }

    getAvatar(message?: Message) {
        return this.avatarService.path(message?.avatar);
    }

    getMessages(): Message[] {
        const messages = this.channelService.getFocusedMessages().sort((m1, m2) => m1.timestamp - m2.timestamp);
        if (
            messages.length &&
            messages[messages.length - 1].sender === this.channelService.userData?.username &&
            this.channelService.receivedMyMessage
        ) {
            this.channelService.receivedMyMessage = false;
            const timeout = 5;
            setTimeout(() => this.scrollToBottom(), timeout);
        }
        return messages;
    }

    handleEvent(event: any) {
        event.preventDefault();
    }

    send() {
        if (this.messageText === '') return;
        this.channelService.sendMessage(this.messageText);
        this.messageText = '';
        const element = document.getElementById('send-message-text');
        element!.style.height = '40px';
        this.scrollToBottom();
    }

    getMessageClass(message: Message) {
        return message.sentByMe ? 'myMessage' : 'theirMessage';
    }

    getMessageInfoClass(message: Message) {
        return message.sentByMe ? 'my-info' : 'their-info';
    }

    scrollToBottom() {
        this.messageContainerElementRef.nativeElement.scrollTop = this.messageContainerElementRef.nativeElement.scrollHeight;
    }

    updateSeachFieldSize() {
        const element = document.getElementById('send-message-text');
        element!.style.height = '40px';
        const height = 80;
        element!.style.height = Math.min(element!.scrollHeight + 1, height) + 'px';
    }

    getTime(message: Message): string {
        const date = new Date(message.timestamp);
        return date.getDay() === new Date().getDay()
            ? date.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' })
            : date.toDateString();
    }
}
