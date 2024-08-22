import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WarningDialogComponent } from '@app/components/config-selection/warning-dialog/warning-dialog.component';
import { DIALOG_CUSTOM_CONFIG } from '@app/constants/dialog-config';
import { GameSelection } from '@app/interfaces/game-card/game-selection';
import { AccountService } from '@app/services/account/account.service';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { GameListManagerService } from '@app/services/divers/game-list-manager.service';
import { GameSelectorService } from '@app/services/game-selection/game-selector.service';
import { CarouselType } from '@common/enums/carousel-type';
import { Language } from '@common/enums/user/language.enum';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit, OnDestroy {
    buttonNames: [string, string, string] = ['Supprimer le jeu', '', ''];
    adminCarouselType = CarouselType.Admin;
    createGamePath: string;
    deleteGamePath: string;
    private componentDestroyed$: Subject<void> = new Subject<void>();

    // eslint-disable-next-line max-params
    constructor(
        public dialog: MatDialog,
        public selectorService: GameSelectorService,
        public gameListManager: GameListManagerService,
        public socketService: SocketClientService,
        private accountService: AccountService,
    ) {}

    ngOnInit(): void {
        if (this.accountService.isLoggedIn) {
            this.selectorService.selectionValue.pipe(takeUntil(this.componentDestroyed$)).subscribe(async (values) => this.clickHandler(values));
        }
        this.updateCreateGameImagePath();
        this.updateDeleteGamesImagePath();
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
    }

    updateCreateGameImagePath(): void {
        if (this.accountService.userLanguage === Language.English) {
            this.createGamePath = './assets/create-game-en.png';
        } else {
            this.createGamePath = './assets/create-game.png';
        }
    }

    updateDeleteGamesImagePath(): void {
        if (this.accountService.userLanguage === Language.English) {
            this.deleteGamePath = './assets/delete-games-en.png';
        } else {
            this.deleteGamePath = './assets/delete-games.png';
        }
    }

    warnPlayer(action: string) {
        const dialogConfig = Object.assign({}, DIALOG_CUSTOM_CONFIG);
        dialogConfig.data = action;
        return this.dialog.open(WarningDialogComponent, dialogConfig);
    }
    deleteAllGames() {
        const dialogRef = this.warnPlayer(this.accountService.userLanguage === Language.English ? 'delete all games' : 'supprimer tous les jeux');
        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) this.gameListManager.deleteAllGames();
        });
    }

    private deleteGame(id: string) {
        const dialogRef = this.warnPlayer(Language.English ? 'delete this game' : 'supprimer ce jeu');
        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) this.gameListManager.deleteGame(id);
        });
    }
    private clickHandler(values: GameSelection) {
        this.deleteGame(values.id);
    }
}
