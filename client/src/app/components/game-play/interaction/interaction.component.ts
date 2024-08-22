import { Component, Input } from '@angular/core';
import { ObserverService } from '@app/services/game-config/observer.service';
import { InteractionState } from '@common/enums/interaction-state';

@Component({
    selector: 'app-interaction',
    templateUrl: './interaction.component.html',
    styleUrls: ['./interaction.component.scss'],
})
export class InteractionComponent {
    @Input() playerNames: string[];
    targetPlayerName: string = 'all';
    interactionStates = InteractionState;

    constructor(public observerService: ObserverService) {}

    startInteraction() {
        this.observerService.targetPlayerName = this.targetPlayerName;
        this.observerService.startInteraction();
    }
}
