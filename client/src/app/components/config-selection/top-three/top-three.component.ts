import { Component, Input } from '@angular/core';
import { BestTimes } from '@common/interfaces/game-card/best-times';

@Component({
    selector: 'app-top-three',
    templateUrl: './top-three.component.html',
    styleUrls: ['./top-three.component.scss'],
})
export class TopThreeComponent {
    @Input() soloScores: BestTimes;
    @Input() vsScores: BestTimes;
}
