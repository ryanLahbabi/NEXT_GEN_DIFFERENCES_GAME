import { TimeConcept } from '@common/interfaces/general/time-concept';
import { THREE_SECONDS } from './game-logic.constants';

describe('THREE_SECONDS constant', () => {
    test('should have seconds set to 3 and minutes set to 0', () => {
        const expectedTime: TimeConcept = { seconds: 3, minutes: 0 };
        expect(THREE_SECONDS).toEqual(expectedTime);
    });
});
