import { Component, Input } from '@angular/core';
import { AvatarService } from '@app/services/divers/avatar.service';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    styleUrls: ['./avatar.component.scss'],
})
export class AvatarComponent {
    @Input() outlineColor: string;
    @Input() imagePath?: string;
    constructor(private readonly avatarService: AvatarService) {}

    get path(): string {
        return this.avatarService.path(this.imagePath);
    }
}
