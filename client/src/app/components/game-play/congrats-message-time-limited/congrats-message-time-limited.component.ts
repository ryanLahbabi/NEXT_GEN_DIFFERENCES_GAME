import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ChatService } from '@app/services/game-play/chat.service';
import { GameService } from '@app/services/game-play/game.service';
import { EndgameOutputDto } from '@common/interfaces/game-play/game-endgame.dto';
@Component({
    selector: 'app-congrats-message-time-limited',
    templateUrl: './congrats-message-time-limited.component.html',
    styleUrls: ['./congrats-message-time-limited.component.scss'],
})
export class CongratsMessageTimeLimitedComponent implements OnInit, OnDestroy {
    @Input() totalDifferences: number;

    // eslint-disable-next-line max-params
    constructor(
        private dialogRef: MatDialogRef<CongratsMessageTimeLimitedComponent>,
        public gameService: GameService,
        public chatService: ChatService,
        private router: Router,
        @Inject(MAT_DIALOG_DATA) public data: { message: EndgameOutputDto; replayIsAvailable: boolean },
    ) {}

    ngOnInit(): void {
        this.dialogRef.disableClose = true;
    }

    ngOnDestroy(): void {
        this.gameService.cleanup();
    }

    closePopup(): void {
        this.dialogRef.close();
        this.router.navigateByUrl('/home');
    }
}
