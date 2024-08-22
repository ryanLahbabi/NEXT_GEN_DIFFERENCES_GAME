import { Server } from 'socket.io';
import EmissionFilter from './emission-filter';
import OutputFilterGateway from './output-filters.gateway';

describe('afterInit', () => {
    it('should the the server', () => {
        const fakeServer = {} as Server;
        OutputFilterGateway.prototype.afterInit(fakeServer);
        expect(EmissionFilter.server).toBe(fakeServer);
        expect(OutputFilterGateway.server).toBe(fakeServer);
    });
});
