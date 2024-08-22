import { Event } from '@common/socket-event-constants';
import { SocketTestHelper } from './socket-test-helper';

describe('SocketTestHelper', () => {
    let socketTestHelper: SocketTestHelper;

    beforeEach(() => {
        socketTestHelper = new SocketTestHelper();
    });

    it('should add callback to callbacks map on calling on method', () => {
        const event = new Event<string>('testEvent');
        const callback = jasmine.createSpy('callback');
        socketTestHelper.on(event, callback);
        expect(socketTestHelper['callbacks'].has(event.name)).toBeTrue();
        expect(socketTestHelper['callbacks'].get(event.name)?.[0]).toEqual(callback);
    });

    it('should call registered callback on calling peerSideEmit method', () => {
        const event = new Event<string>('testEvent');
        const eventData = 'testData';
        const callback = jasmine.createSpy('callback');
        socketTestHelper.on(event, callback);
        socketTestHelper.peerSideEmit(event, eventData);
        expect(callback).toHaveBeenCalledWith(eventData);
    });

    it('should not call registered callback if the event is not registered', () => {
        const event = new Event<string>('testEvent');
        const otherEvent = new Event<string>('anotherEvent');
        const eventData = 'testData';
        const callback = jasmine.createSpy('callback');
        socketTestHelper.on(otherEvent, callback);
        socketTestHelper.peerSideEmit(event, eventData);
        expect(callback).not.toHaveBeenCalled();
    });
    it('should do nothing on calling emit method', () => {
        const event = new Event<string>('testEvent');
        const eventData = 'testData';
        expect(() => socketTestHelper.emit(event.name, eventData)).not.toThrow();
    });

    it('should do nothing on calling disconnect method', () => {
        expect(() => socketTestHelper.disconnect()).not.toThrow();
    });

    it('should do nothing on calling connect method', () => {
        expect(() => socketTestHelper.connect()).not.toThrow();
    });
});
