import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { WarningDialogComponent } from '@app/components/config-selection/warning-dialog/warning-dialog.component';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import * as Events from '@common/socket-event-constants';

import { DIALOG_CUSTOM_CONFIG } from '@app/constants/dialog-config';
import {
    DEFAULT_PENALTY_AND_GAINED,
    DEFAULT_TIMER,
    MAX_PENALTY_AND_GAINED,
    MAX_TIMER,
    MIN_PENALTY_AND_GAINED,
    MIN_TIMER,
} from '@app/constants/time-constants';
import { GameValues } from '@common/interfaces/game-play/game-values';
import { ToServer } from '@common/socket-event-constants';

@Component({
    selector: 'app-game-constants',
    templateUrl: './game-constants.component.html',
    styleUrls: ['./game-constants.component.scss'],
})
export class GameConstantsComponent implements OnInit {
    @ViewChild('userInputChrono', { static: false }) userInputChrono: ElementRef;
    @ViewChild('userInputPenalty', { static: false }) userInputPenalty: ElementRef;
    @ViewChild('userInputGain', { static: false }) userInputGain: ElementRef;
    currentTimerTime: number;
    currentPenaltyTime: number;
    currentGainedTime: number;
    isInRange: boolean = true;

    constructor(public socketService: SocketClientService, public dialogRef: MatDialogRef<GameConstantsComponent>, public dialog: MatDialog) {}

    ngOnInit(): void {
        this.socketService.on(Events.FromServer.GAME_VALUES, (data: typeof Events.FromServer.GAME_VALUES.type) => {
            this.currentTimerTime = data.timerTime;
            this.currentPenaltyTime = data.penaltyTime;
            this.currentGainedTime = data.gainedTime;
        });
        this.socketService.send(ToServer.GET_GAME_VALUES);
    }

    resetDefaultValues() {
        this.currentTimerTime = DEFAULT_TIMER;
        this.currentPenaltyTime = DEFAULT_PENALTY_AND_GAINED;
        this.currentGainedTime = DEFAULT_PENALTY_AND_GAINED;
        this.userInputChrono.nativeElement.value = DEFAULT_TIMER;
        this.userInputPenalty.nativeElement.value = DEFAULT_PENALTY_AND_GAINED;
        this.userInputGain.nativeElement.value = DEFAULT_PENALTY_AND_GAINED;
    }

    confirm(timer: string, penalty: string, gained: string) {
        const warningDialogRef = this.warnUser();
        warningDialogRef.afterClosed().subscribe((confirmed: boolean) => {
            if (confirmed) {
                const constants = {
                    timerTime: Math.max(MIN_TIMER, Math.min(MAX_TIMER, parseInt(timer, 10))),
                    penaltyTime: Math.max(MIN_PENALTY_AND_GAINED, Math.min(MAX_PENALTY_AND_GAINED, parseInt(penalty, 10))),
                    gainedTime: Math.max(MIN_PENALTY_AND_GAINED, Math.min(MAX_PENALTY_AND_GAINED, parseInt(gained, 10))),
                } as GameValues;
                this.socketService.send(ToServer.SET_GAME_VALUES, constants);
                this.closeDialog();
                this.isInRange = true;
            }
        });
    }

    closeDialog() {
        this.dialogRef.close();
    }

    warnBadValue(timerTime: string, penaltyTime: string, gainedTime: string) {
        if (
            parseInt(timerTime, 10) < MIN_TIMER ||
            parseInt(timerTime, 10) > MAX_TIMER ||
            parseInt(penaltyTime, 10) < MIN_PENALTY_AND_GAINED ||
            parseInt(penaltyTime, 10) > MAX_PENALTY_AND_GAINED ||
            parseInt(gainedTime, 10) < MIN_PENALTY_AND_GAINED ||
            parseInt(gainedTime, 10) > MAX_PENALTY_AND_GAINED
        ) {
            this.isInRange = false;
        } else {
            this.isInRange = true;
        }
    }

    private warnUser() {
        const dialogConfig = Object.assign({}, DIALOG_CUSTOM_CONFIG);
        dialogConfig.data = 'modifier les constantes de jeu';
        return this.dialog.open(WarningDialogComponent, dialogConfig);
    }
}
