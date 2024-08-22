import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '@app/components/config-selection/components/confirm-dialog/confirm-dialog.component';
import { LoadingComponent } from '@app/components/config-selection/loading/loading.component';
import { GameService } from '@app/services/game-play/game.service';
import { ReplayListService } from '@app/services/game-play/replay-list.service';
import { ReplayService } from '@app/services/game-play/replay.service';

@Component({
    selector: 'app-replay-list',
    templateUrl: './replay-list.component.html',
    styleUrls: ['./replay-list.component.scss'],
})
export class ReplayListComponent {
    // filteredReplayDateList: string[] = [];
    // filters = { date: '' };

    // eslint-disable-next-line max-params
    constructor(
        private dialog: MatDialog,
        private replayListService: ReplayListService,
        private router: Router,
        private replayService: ReplayService,
        private gameService: GameService,
    ) {}

    get allReplays() {
        return this.replayListService.replayList;
    }

    deleteReplay(date: string): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '250px',
            data: { message: `Are you sure you want to delete the replay for ${date}?` },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.replayListService
                    .deleteReplayByDateForCurrentUser(date)
                    .then(() => alert('Replay deleted successfully'))
                    .catch(() => alert('Failed to delete replay'));
            }
        });
    }

    selectReplay(date: string): void {
        const dialogRef = this.dialog.open(LoadingComponent);
        this.replayListService.getReplayByDatesForCurrentUser(date).subscribe({
            next: (replay) => {
                dialogRef.close();
                if (!replay) {
                    return;
                }
                this.replayService.resetEverything();
                this.replayService.setGameService(this.gameService);
                this.replayService.setReplay(replay);
                this.replayService.isReplayMode = true;
                this.router.navigate(['/game'], { queryParams: { replay: true } });
            },
            error: () => {
                dialogRef.close();
            },
        });
    }

    parseISOString(isoDate: string) {
        return new Date(isoDate).toLocaleString('fr-CA', { timeZone: 'America/Toronto' }).split('min')[0];
    }

    // applyFilters(): void {
    //     this.filteredReplayDateList = this.allReplays.filter((replay) => {
    //         return replay.toString().includes(this.filters.date);
    //     });
    // }
}
