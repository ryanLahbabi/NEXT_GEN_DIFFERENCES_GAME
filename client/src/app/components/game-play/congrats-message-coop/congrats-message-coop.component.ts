import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AccountService } from '@app/services/account/account.service';
import { ChatService } from '@app/services/game-play/chat.service';
import { ReplayService } from '@app/services/game-play/replay.service';
import { Language } from '@common/enums/user/language.enum';
import { EndgameOutputDto } from '@common/interfaces/game-play/game-endgame.dto';
import { PlayerRecord } from '@common/interfaces/records/player-record';

@Component({
    selector: 'app-congrats-message-coop',
    templateUrl: './congrats-message-coop.component.html',
    styleUrls: ['./congrats-message-coop.component.scss'],
})
export class CongratsMessageCoopComponent implements OnInit {
    winner: PlayerRecord;
    isWinner: boolean = false;
    congratsWinnerPath: string;
    congratsLoserPath: string;

    // eslint-disable-next-line max-params
    constructor(
        private dialogRef: MatDialogRef<CongratsMessageCoopComponent>,
        public chatService: ChatService,
        private router: Router,
        private replayService: ReplayService,
        private accountService: AccountService,
        @Inject(MAT_DIALOG_DATA) public data: { message: EndgameOutputDto; replayIsAvailable: boolean; isObserving: boolean },
    ) {
        if (data.isObserving === undefined) data.isObserving = false;
    }
    ngOnInit(): void {
        this.dialogRef.disableClose = true;
        this.winner = this.data.message.players[0].winner ? this.data.message.players[0] : this.data.message.players[1];
        if (this.chatService.gameData && this.winner.name === this.chatService.gameData.name) {
            this.isWinner = true;
        }
        this.updateCongratsWinnerImagePath();
        this.updateCongratsLoserImagePath();
    }

    updateCongratsWinnerImagePath(): void {
        if (this.accountService.userLanguage === Language.English) {
            this.congratsWinnerPath = './assets/congrats-coop-en.png';
        } else {
            this.congratsWinnerPath = './assets/congrats-coop.png';
        }
    }

    updateCongratsLoserImagePath(): void {
        if (this.accountService.userLanguage === Language.English) {
            this.congratsLoserPath = './assets/congrats-coop-lose-en.png';
        } else {
            this.congratsLoserPath = './assets/congrats-coop-loser.png';
        }
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
