import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-paper-button',
    templateUrl: './paper-button.component.html',
    styleUrls: ['./paper-button.component.scss'],
})
export class PaperButtonComponent {
    @Input() name: string;
}
