import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-player-list',
    templateUrl: './player-list.component.html',
    styleUrls: ['./player-list.component.scss'],
})
export class PlayerListComponent {
    @Input() playerNames: string[];
    @Input() text: string;
}
