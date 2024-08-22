import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChatService } from '@app/services/game-play/chat.service';
import { ReplayService } from '@app/services/game-play/replay.service';

@Component({
    selector: 'app-congrats-message',
    templateUrl: './congrats-message.component.html',
    styleUrls: ['./congrats-message.component.scss'],
})
export class CongratsMessageComponent {
    @Input() winners: string[];
    // eslint-disable-next-line max-params
    constructor(
        private dialogRef: MatDialogRef<CongratsMessageComponent>,
        public chatService: ChatService,
        private router: Router,
        private replayService: ReplayService,
        @Inject(MAT_DIALOG_DATA)
        public data: { replayIsAvailable: boolean },
    ) {
        this.dialogRef.disableClose = true;
    }

    closePopup(replay: boolean): void {
        this.dialogRef.close();
        if (replay) {
            this.replayService.restart();
        } else {
            this.router.navigateByUrl('/home');
        }
        this.chatService.recordBeaterMessage = '';
    }
}
