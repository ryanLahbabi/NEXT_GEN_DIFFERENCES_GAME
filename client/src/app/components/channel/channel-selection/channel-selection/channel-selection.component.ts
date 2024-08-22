import { Component, Input } from '@angular/core';
import { ChatService } from '@app/services/game-play/chat.service';
import { ChannelDTO } from '@common/dto/channel/channel.dto';

enum ChannelView {
    MyChannels,
    OtherChannels,
}

@Component({
    selector: 'app-channel-selection',
    templateUrl: './channel-selection.component.html',
    styleUrls: ['./channel-selection.component.scss'],
})
export class ChannelSelectionComponent {
    @Input() changeView: () => void;
    channelView: ChannelView = ChannelView.MyChannels;
    newChannelName = '';
    buttonText = 'My Channels';
    filter = '';

    constructor(private channelService: ChatService) {}

    get changedView(): boolean {
        return this.changeView !== undefined;
    }

    get viewingMyChannels(): boolean {
        return this.channelView === ChannelView.MyChannels;
    }

    get viewingOtherChannels(): boolean {
        return this.channelView === ChannelView.OtherChannels;
    }

    get allOtherChannels(): ChannelDTO[] {
        return this.filterChannels(this.channelService.otherChannels);
    }

    get allMyChannels(): ChannelDTO[] {
        return this.filterChannels(this.channelService.myChannels);
    }

    filterChannels(channels: ChannelDTO[]): ChannelDTO[] {
        return channels.filter((c) => c.name?.toLowerCase().includes(this.filter.toLowerCase()));
    }

    emptyArea(event: any) {
        event.preventDefault();
    }

    setFocusedConversation(channelId: string) {
        if (this.changeView) {
            this.changeView();
        }
        this.channelService.setFocusedConversation(channelId);
    }

    joinChannel(channelId: string) {
        this.channelService.joinChannel(channelId);
    }

    leaveChannel(channelId: string) {
        this.setFocusedConversation('0');
        this.channelService.leaveChannel(channelId);
    }

    createChannel() {
        this.channelService.createChannel(this.newChannelName);
        this.newChannelName = '';
    }

    switchView() {
        this.filter = '';
        switch (this.channelView) {
            case ChannelView.MyChannels:
                this.channelView = ChannelView.OtherChannels;
                this.buttonText = 'Join Channels';
                break;
            case ChannelView.OtherChannels:
                this.channelView = ChannelView.MyChannels;
                this.buttonText = 'My Channels';
                break;
        }
    }

    getSwitchViewButtonClass() {
        return this.channelView === ChannelView.MyChannels ? 'search-img' : 'chat-img';
    }

    getSelectedChannelClass(channelId: string): string {
        return this.channelService.focusedConversationId === channelId ? 'focused-channel' : 'my-channel';
    }
}
