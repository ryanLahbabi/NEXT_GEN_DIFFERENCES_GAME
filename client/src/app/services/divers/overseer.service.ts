import { Injectable, OnDestroy } from '@angular/core';
import { HttpService } from '@app/services/communication/http.service';
import { FriendsService } from '@app/services/friends/friends.service';
import { HistoryService } from '@app/services/game-config/history.service';
import { ObserverService } from '@app/services/game-config/observer.service';
import { ChatService } from '@app/services/game-play/chat.service';
import { GameTimeService } from '@app/services/game-play/game-time.service';
import { GameService } from '@app/services/game-play/game.service';
import { ReplayListService } from '@app/services/game-play/replay-list.service';
import { ReplayService } from '@app/services/game-play/replay.service';
import { PrivateUserDataDTO } from '@common/dto/user/private-user-data.dto';
import { AvatarService } from './avatar.service';
import { GameListManagerService } from './game-list-manager.service';
import { SettingsService } from './settings.service';

@Injectable({
    providedIn: 'root',
})
export class OverseerService implements OnDestroy {
    // eslint-disable-next-line max-params
    constructor(
        private readonly gameList: GameListManagerService,
        private readonly httpService: HttpService,
        private readonly historyService: HistoryService,
        private readonly chatService: ChatService,
        private readonly gameTimeService: GameTimeService,
        private readonly gameService: GameService,
        private readonly friendService: FriendsService,
        private readonly ongoingGameService: ObserverService,
        private readonly settingsService: SettingsService,
        private readonly replayService: ReplayService,
        private readonly replayListService: ReplayListService,
        private readonly avatarService: AvatarService,
    ) {}

    init(userData: PrivateUserDataDTO, getToken: () => string) {
        // if (this.accountService.hasBeenLoggedOut) {
        //     this.resetServices();
        //     this.accountService.hasBeenLoggedOut = false;
        // }
        this.httpService.init(getToken);
        this.avatarService.init(userData);
        this.gameList.init(userData);
        this.historyService.init();
        this.chatService.init(userData);
        this.gameTimeService.init();
        this.gameService.init();
        this.friendService.init(userData);
        this.ongoingGameService.init();
        this.replayService.init(userData);
        this.settingsService.init(userData);
        this.replayService.init(userData);
        this.replayListService.init();
    }

    ngOnDestroy(): void {
        this.gameService.cleanup();
    }
}
