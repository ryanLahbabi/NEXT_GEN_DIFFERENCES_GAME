import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-post-it',
    templateUrl: './post-it.component.html',
    styleUrls: ['./post-it.component.scss'],
})
export class PostItComponent {
    @Input() name: string | undefined = undefined;
    @Input() image: string | undefined = undefined;
}
