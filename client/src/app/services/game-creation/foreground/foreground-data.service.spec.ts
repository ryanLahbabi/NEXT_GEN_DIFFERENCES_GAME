import { TestBed } from '@angular/core/testing';
import { ForegroundDataService } from './foreground-data.service';

describe('ForegroundDataService', () => {
    let service: ForegroundDataService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ForegroundDataService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('get foregroundData should return the current state', () => {
        const currentState = { original: 'test', modified: 'test' };
        service['currentState'] = currentState;
        expect(service.foregroundData).toEqual(currentState);
    });

    it('undo should be possible if there are previous states', () => {
        service['previousStates'] = [{ original: '', modified: '' }];
        expect(service.undoIsPossible).toBeTruthy();
    });

    it('undo should not be possible if there is no previous state', () => {
        service['previousStates'] = [];
        expect(service.undoIsPossible).toBeFalsy();
    });

    it('redo should be possible if there are undone states', () => {
        service['undoneStates'] = [{ original: '', modified: '' }];
        expect(service.redoIsPossible).toBeTruthy();
    });

    it('redo should not be possible if there is no undone state', () => {
        service['undoneStates'] = [];
        expect(service.redoIsPossible).toBeFalsy();
    });

    it('reset should clear the current state', () => {
        service['currentState'] = { original: 'test', modified: 'test' };
        service.reset();
        expect(service['currentState']).toEqual({ original: '', modified: '' });
    });

    it('reset should clear the previous states', () => {
        service['previousStates'] = [{ original: '', modified: '' }];
        service.reset();
        expect(service['previousStates'].length).toEqual(0);
    });

    it('reset should clear the undone states', () => {
        service['undoneStates'] = [{ original: '', modified: '' }];
        service.reset();
        expect(service['undoneStates'].length).toEqual(0);
    });

    it('undo should replace the current state with the most recent previous state', () => {
        const previousState = { original: 'o1', modified: 'm1' };
        const currentState = { original: 'o2', modified: 'm2' };
        service['previousStates'] = [previousState];
        service['currentState'] = currentState;
        service.undo();
        expect(service['currentState']).toEqual(previousState);
    });

    it('undo should add the current state to the undone states', () => {
        const previousState = { original: 'o1', modified: 'm1' };
        const currentState = { original: 'o2', modified: 'm2' };
        service['previousStates'] = [previousState];
        service['currentState'] = currentState;
        service.undo();
        expect(service['undoneStates'].pop()).toEqual(currentState);
    });

    it('redo should replace the current state with the most recent undone state', () => {
        const undoneState = { original: 'o3', modified: 'm3' };
        const currentState = { original: 'o2', modified: 'm2' };
        service['undoneStates'] = [undoneState];
        service['currentState'] = currentState;
        service.redo();
        expect(service['currentState']).toEqual(undoneState);
    });

    it('undo should add the current state to the previous states', () => {
        const undoneState = { original: 'o3', modified: 'm3' };
        const currentState = { original: 'o2', modified: 'm2' };
        service['undoneStates'] = [undoneState];
        service['currentState'] = currentState;
        service.redo();
        expect(service['previousStates'].pop()).toEqual(currentState);
    });

    it('saveState should clear the undone states', () => {
        service['undoneStates'] = [{ original: '', modified: '' }];
        service.saveState({ original: '', modified: '' });
        expect(service['undoneStates'].length).toEqual(0);
    });

    it('saveState should add the current state to the previous states', () => {
        const currentState = { original: 'o-2', modified: 'm-2' };
        const newState = { original: 'o3', modified: 'm3' };
        service['currentState'] = currentState;
        service.saveState(newState);
        expect(service['previousStates'].pop()).toEqual(currentState);
    });

    it('saveState should replace the current state with the new state', () => {
        const currentState = { original: 'o-2', modified: 'm-2' };
        const newState = { original: 'o3', modified: 'm3' };
        service['currentState'] = currentState;
        service.saveState(newState);
        expect(service['currentState']).toEqual(newState);
    });

    it('changeState should call saveState', () => {
        const newState = { original: 'o3', modified: 'm3' };
        const saveStateSpy = spyOn(service, 'saveState');
        service.changeState(newState);
        expect(saveStateSpy).toHaveBeenCalledWith(newState);
    });

    it('changeState should call emitStateChangeEvent', () => {
        const newState = { original: 'o3', modified: 'm3' };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const emitStateChangeEventSpy = spyOn<any>(service, 'emitStateChangeEvent');
        service.changeState(newState);
        expect(emitStateChangeEventSpy).toHaveBeenCalledWith();
    });

    it('emitStateChangeEvent should emit a stateChangeEvent', () => {
        const newState = { original: 'o3', modified: 'm3' };
        const emitSpy = spyOn(service.stateChangeEvent, 'emit');
        service.changeState(newState);
        expect(emitSpy).toHaveBeenCalledWith(newState);
    });
});
