import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-arrow-game-selection',
    templateUrl: './arrow-game-selection.component.html',
    styleUrls: ['./arrow-game-selection.component.scss'],
})
export class ArrowGameSelectionComponent {
    @Input() flip: boolean;
    @Output() buttonClick: EventEmitter<null> = new EventEmitter();
    @Input() activated: boolean;

    onClick() {
        if (this.activated) {
            this.buttonClick.emit();
        }
    }
}
