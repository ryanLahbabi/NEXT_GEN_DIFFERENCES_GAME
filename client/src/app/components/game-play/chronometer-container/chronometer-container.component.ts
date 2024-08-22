import { Component } from '@angular/core';
import { GameTimeService } from '@app/services/game-play/game-time.service';

@Component({
    selector: 'app-chronometer-container',
    templateUrl: './chronometer-container.component.html',
    styleUrls: ['./chronometer-container.component.scss'],
})
export class ChronometerContainerComponent {
    constructor(private gameTimeService: GameTimeService) {}

    get time() {
        return this.gameTimeService.time;
    }
}
