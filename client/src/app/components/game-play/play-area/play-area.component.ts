import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ERROR_HEIGHT, ERROR_WIDTH, INTERACTION_DURATION, PENALITY_DURATION } from '@app/constants/game-constants';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/constants/images-constants';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { DelayService } from '@app/services/divers/delay.service';
import { ObserverService } from '@app/services/game-config/observer.service';
import { GameDataService } from '@app/services/game-play/game-data.service';
import { GameService } from '@app/services/game-play/game.service';
import { ReplayService } from '@app/services/game-play/replay.service';
import { ObserverHelpResponseDTO } from '@common/dto/game/observer-help-response.dto';
import { Coordinates } from '@common/interfaces/general/coordinates';
import { ToServer } from '@common/socket-event-constants';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements OnInit, OnDestroy {
    @Input() name: string;
    @Input() isObserving: boolean;
    @Input() isModified: boolean;
    @Input() backgroundImageUrl: string;
    @ViewChild('canvas') canvas: ElementRef;
    errorIsVisible: boolean = false;
    errorX: number;
    errorY: number;
    errorWidth: number = ERROR_WIDTH;
    errorHeight: number = ERROR_HEIGHT;

    private gameId: string;
    private clickCoordinates: Coordinates;
    private canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    private displayedInteractions: ObserverHelpResponseDTO[] = [];
    private offset: Coordinates;
    private isInteracting = false;
    private componentDestroyed$: Subject<void> = new Subject<void>();

    // eslint-disable-next-line max-params
    constructor(
        private socketService: SocketClientService,
        private gameData: GameDataService,
        private gameService: GameService,
        private replayService: ReplayService,
        private delayService: DelayService,
        private observerService: ObserverService,
    ) {
        this.gameId = this.gameData.gameID;
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(): void {
        if (this.isInteracting) {
            this.isInteracting = false;
            this.observerService.onMouseUp(this.canvas.nativeElement.getContext('2d'));
        }
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(e: MouseEvent): void {
        if (this.isInteracting) this.observerService.onMouseMove(this.getMouseCoord(e), this.canvas.nativeElement.getContext('2d'));
    }

    onMouseDown(e: MouseEvent): void {
        this.isInteracting = true;
        this.offset = { x: e.clientX - e.offsetX, y: e.clientY - e.offsetY };
        this.observerService.onMouseDown({ x: e.offsetX, y: e.offsetY });
    }

    ngOnInit(): void {
        if (this.replayService.isReplayMode) {
            this.reset();
        } else {
            this.observerService.interactionEvent.pipe(takeUntil(this.componentDestroyed$)).subscribe(this.addInteraction.bind(this));
            this.replayService.replayEvent.subscribe(this.reset.bind(this));
            this.replayService.replayActionTrigger.pipe(takeUntil(this.componentDestroyed$)).subscribe((action) => {
                switch (action.category) {
                    case 'setClickCoordinates':
                        this.setClickCoordinates(action.input as Coordinates);
                        break;
                    case 'setLastClickArea':
                        this.setLastClickArea();
                        break;
                    case 'addInteraction':
                        this.addInteraction(action.input as ObserverHelpResponseDTO);
                        break;
                }
            });
        }
    }

    ngOnDestroy(): void {
        this.gameService.cleanup();
        this.componentDestroyed$.next();
        this.componentDestroyed$.complete();
        this.replayService.resetEverything();
    }

    mouseHitDetect(event: MouseEvent): void {
        if (this.replayService.isReplayMode) {
            return;
        }
        const mousePosition = { x: event.offsetX, y: event.offsetY };
        this.replayService.doAndStore('setClickCoordinates', mousePosition);
        this.requestServerCheck(mousePosition);
    }

    setLastClickArea(): void {
        this.gameService.lastClickArea = this;
    }

    setClickCoordinates(coordinates: Coordinates) {
        if (!this.isObserving) this.clickCoordinates = coordinates;
    }

    async showErrorMessage(): Promise<void> {
        this.errorX = this.calculateErrorCoordinate(this.clickCoordinates.x, this.errorWidth, this.width);
        this.errorY = this.calculateErrorCoordinate(this.clickCoordinates.y, this.errorHeight, this.height);
        this.errorIsVisible = true;
        await this.delayService.wait(PENALITY_DURATION);
        this.errorIsVisible = false;
    }

    private async addInteraction(interaction: ObserverHelpResponseDTO): Promise<void> {
        this.replayService.store('addInteraction', interaction);
        this.displayedInteractions.push(interaction);
        this.displayInteractions();
        await this.delayService.wait(INTERACTION_DURATION);
        this.hideInteraction();
    }

    private displayInteractions() {
        const context = this.canvas.nativeElement.getContext('2d');
        this.observerService.clearInteractions(context);
        this.displayedInteractions.forEach((inter) => {
            this.observerService.drawInteraction(inter.zoneCoordinates, context, inter.observerUsername);
        });
    }

    private hideInteraction(): void {
        this.displayedInteractions.shift();
        this.displayInteractions();
    }

    private requestServerCheck(coordinates: Coordinates): void {
        if (!this.isObserving) {
            const clickMessage = {
                gameId: this.gameId,
                x: coordinates.x,
                y: coordinates.y,
            };
            this.replayService.doAndStore('setLastClickArea', coordinates);
            this.socketService.send(ToServer.CLICK, clickMessage);
            this.setLastClickArea();
        }
    }

    private calculateErrorCoordinate(clickCoordinate: number, messageDimension: number, boundary: number): number {
        if (clickCoordinate - messageDimension / 2 < 0) {
            return 0;
        } else if (clickCoordinate + messageDimension / 2 > boundary) {
            return boundary - messageDimension;
        } else {
            return clickCoordinate - messageDimension / 2;
        }
    }

    private reset() {
        this.errorIsVisible = false;
        this.displayedInteractions = [];
    }

    private getMouseCoord(e: MouseEvent): Coordinates {
        return { x: e.clientX - this.offset.x, y: e.clientY - this.offset.y };
    }
}
