import { EventEmitter, Injectable } from '@angular/core';
import { ForegroundState } from '@common/interfaces/game-creation/foreground-state';

@Injectable({
    providedIn: 'root',
})
export class ForegroundDataService {
    stateChangeEvent = new EventEmitter<ForegroundState>();
    private currentState: ForegroundState;
    private previousStates: ForegroundState[];
    private undoneStates: ForegroundState[];

    constructor() {
        this.reset();
    }

    get foregroundData() {
        return this.currentState;
    }

    get undoIsPossible(): boolean {
        return this.previousStates.length > 0;
    }

    get redoIsPossible(): boolean {
        return this.undoneStates.length > 0;
    }

    reset() {
        this.currentState = { original: '', modified: '' };
        this.previousStates = [];
        this.undoneStates = [];
    }

    undo() {
        const previousState = this.previousStates.pop();
        if (previousState) {
            this.undoneStates.push(this.currentState);
            this.currentState = previousState;
            this.emitStateChangeEvent();
        }
    }

    redo() {
        const undoneState = this.undoneStates.pop();
        if (undoneState) {
            this.previousStates.push(this.currentState);
            this.currentState = undoneState;
            this.emitStateChangeEvent();
        }
    }

    saveState(newState: ForegroundState) {
        this.undoneStates = [];
        this.previousStates.push(this.currentState);
        this.currentState = newState;
    }

    changeState(newState: ForegroundState) {
        this.saveState(newState);
        this.emitStateChangeEvent();
    }

    private emitStateChangeEvent() {
        this.stateChangeEvent.emit(this.currentState);
    }
}
