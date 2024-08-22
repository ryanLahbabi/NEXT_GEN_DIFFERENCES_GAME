import { TestBed } from '@angular/core/testing';
import { SocketClientService } from '@app/services/communication/socket-client.service';
import { GameTimeService } from './game-time.service';
import SpyObj = jasmine.SpyObj;

describe('GameTimeService', () => {
    let service: GameTimeService;
    let socketServiceSpy: SpyObj<SocketClientService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketClientService', ['on']);
        TestBed.configureTestingModule({
            providers: [{ provide: SocketClientService, useValue: socketServiceSpy }],
        });
        service = TestBed.inject(GameTimeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set displayedTime and preciseTime correctly', () => {
        const time = 3.4;
        service.time = time;
        expect(service['displayedTime']).toEqual(3);
        expect(service['preciseTime']).toEqual(time);
    });

    it('should get the next recorded time and increment index', () => {
        service.recordedTimeIndex = 0;
        service.recordedTimes = [1, 2, 3];
        service.nextRecordedTime();
        expect(service.time).toEqual(1);
        expect(service.recordedTimeIndex).toEqual(1);
    });

    it('should update the time on timeEvent if it is not replayMode', () => {
        const previousTime = 5;
        const newTime = 10;
        service.time = previousTime;
        service.isReplayMode = false;
        service.recordedTimes = [];
        service['processTimeEvent'](newTime);
        expect(service.time).toEqual(newTime);
        expect(service.recordedTimes).toEqual([newTime]);
    });

    it('should not update the time on timeEvent if it is replayMode', () => {
        const previousTime = 5;
        const newTime = 10;
        service.time = previousTime;
        service.isReplayMode = true;
        service.recordedTimes = [];
        service['processTimeEvent'](newTime);
        expect(service.time).toEqual(previousTime);
        expect(service.recordedTimes).toEqual([]);
    });
});
