import { Component } from '@angular/core';

@Component({
    selector: 'app-channel-toggle',
    templateUrl: './channel-toggle.component.html',
    styleUrls: ['./channel-toggle.component.scss'],
})
export class ChannelToggleComponent {
    showChannelView = false;
    buttonStyles = { openChat: 'toggle-on-button', closeChat: 'toggle-off-button' };

    toggleChannelView() {
        this.showChannelView = !this.showChannelView;
    }

    getBtnStyle(): string {
        return this.showChannelView ? this.buttonStyles.closeChat : this.buttonStyles.openChat;
    }
}
