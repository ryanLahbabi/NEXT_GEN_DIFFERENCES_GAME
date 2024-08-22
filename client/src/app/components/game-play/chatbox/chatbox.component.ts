import { Component, OnInit } from '@angular/core';
import { INTERVAL_TIME } from '@app/constants/time-constants';
import { ChatService } from '@app/services/game-play/chat.service';
import { GameDataService } from '@app/services/game-play/game-data.service';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent implements OnInit {
    constructor(public chatService: ChatService, public gameData: GameDataService) {}

    ngOnInit() {
        setInterval(() => {
            this.chatService.gameMode = this.gameData.gameMode;
            this.chatService.getGameMode();
            this.chatService.differenceFounded();
            this.chatService.differenceMistakeMade();
            this.chatService.differenceFound = false;
            this.chatService.differenceError = false;
        }, INTERVAL_TIME);
        this.chatService.waitForEnemyClick();

        this.chatService.reset();
    }
}
