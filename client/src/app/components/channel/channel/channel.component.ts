import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-channel',
    templateUrl: './channel.component.html',
    styleUrls: ['./channel.component.scss'],
})
export class ChannelComponent {
    @Input() toggle = true;
    @Output() myOutput = new EventEmitter<void>();

    changeView() {
        return () => {
            this.myOutput.emit();
        };
    }
}
