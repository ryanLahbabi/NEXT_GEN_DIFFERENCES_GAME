import { BestTime } from '@common/interfaces/game-card/best-time';
import { BestTimes } from '@common/interfaces/game-card/best-times';
import BestTimesModifier from './best-times-modifier';

namespace BestTimesModifierSpy {
    export const updateBestTime = jest.fn();
    export const updateBestTimes = jest.fn();
}

describe('BestTimesModifier', () => {
    let newBestTime: BestTime;
    let oldBestTimes: BestTimes;
    let oldBestTimesCopy: BestTimes;
    const setNewBestTime = (seconds: number, minutes: number) => (newBestTime.time = { seconds, minutes });

    beforeAll(() => {
        BestTimesModifier.updateBestTime = BestTimesModifierSpy.updateBestTime.mockImplementation(BestTimesModifier.updateBestTime);
        BestTimesModifier.updateBestTimes = BestTimesModifierSpy.updateBestTimes.mockImplementation(BestTimesModifier.updateBestTimes);
    });

    beforeEach(() => {
        oldBestTimes = {
            firstPlace: { name: '1', time: { seconds: 15, minutes: 1 } },
            secondPlace: { name: '2', time: { seconds: 30, minutes: 1 } },
            thirdPlace: { name: '3', time: { seconds: 45, minutes: 1 } },
        };
        oldBestTimesCopy = JSON.parse(JSON.stringify(oldBestTimes));
        newBestTime = { name: 'fakePlayer', time: undefined };
        jest.clearAllMocks();
    });

    describe('updateBestTimes', () => {
        it('should return false if the new time or the best times is undefined', () => {
            expect(BestTimesModifier.updateBestTimes(undefined, newBestTime)).toBeFalsy();
            expect(BestTimesModifier.updateBestTimes(oldBestTimes, undefined)).toBeFalsy();
            expect(BestTimesModifier.updateBestTimes(undefined, undefined)).toBeFalsy();
            expect(BestTimesModifierSpy.updateBestTime).not.toHaveBeenCalled();
        });

        it('should replace the first place and shift the other best times properly', () => {
            setNewBestTime(oldBestTimes.firstPlace.time.seconds - 1, oldBestTimes.firstPlace.time.minutes);
            expect(BestTimesModifier.updateBestTimes(oldBestTimes, newBestTime)).toBeTruthy();
            expect(oldBestTimes.firstPlace).toEqual(newBestTime);
            expect(oldBestTimes.secondPlace).toEqual(oldBestTimesCopy.firstPlace);
            expect(oldBestTimes.thirdPlace).toEqual(oldBestTimesCopy.secondPlace);
            expect(BestTimesModifierSpy.updateBestTime).toHaveBeenCalledTimes(1);
        });

        it('should replace the second place and shift the other best times properly', () => {
            setNewBestTime(oldBestTimes.secondPlace.time.seconds - 1, oldBestTimes.firstPlace.time.minutes);
            expect(BestTimesModifier.updateBestTimes(oldBestTimes, newBestTime)).toBeTruthy();
            expect(oldBestTimes.firstPlace).toEqual(oldBestTimesCopy.firstPlace);
            expect(oldBestTimes.secondPlace).toEqual(newBestTime);
            expect(oldBestTimes.thirdPlace).toEqual(oldBestTimesCopy.secondPlace);
            expect(BestTimesModifierSpy.updateBestTime).toHaveBeenCalledTimes(2);
        });

        it('should replace the third place', () => {
            setNewBestTime(oldBestTimes.thirdPlace.time.seconds - 1, oldBestTimes.firstPlace.time.minutes);
            expect(BestTimesModifier.updateBestTimes(oldBestTimes, newBestTime)).toBeTruthy();
            expect(oldBestTimes.firstPlace).toEqual(oldBestTimesCopy.firstPlace);
            expect(oldBestTimes.secondPlace).toEqual(oldBestTimesCopy.secondPlace);
            expect(oldBestTimes.thirdPlace).toEqual(newBestTime);
            expect(BestTimesModifierSpy.updateBestTime).toHaveBeenCalledTimes(3);
        });

        it('should return false if the new time is longer than the present best times', () => {
            setNewBestTime(oldBestTimes.thirdPlace.time.seconds + 1, oldBestTimes.firstPlace.time.minutes);
            expect(BestTimesModifier.updateBestTimes(oldBestTimes, newBestTime)).toBeFalsy();
            expect(oldBestTimes.firstPlace).toEqual(oldBestTimesCopy.firstPlace);
            expect(oldBestTimes.secondPlace).toEqual(oldBestTimesCopy.secondPlace);
            expect(oldBestTimes.thirdPlace).toEqual(oldBestTimes.thirdPlace);
            expect(BestTimesModifierSpy.updateBestTime).toHaveBeenCalledTimes(3);
        });
    });

    describe('updateBestTime', () => {
        it('should return true if the new time is shorter than the old time', () => {
            setNewBestTime(oldBestTimes.firstPlace.time.seconds - 1, oldBestTimes.firstPlace.time.minutes);
            expect(BestTimesModifier.updateBestTime(oldBestTimes.firstPlace, newBestTime)).toBeTruthy();
            setNewBestTime(oldBestTimes.firstPlace.time.seconds, oldBestTimes.firstPlace.time.minutes - 1);
            expect(BestTimesModifier.updateBestTime(oldBestTimes.firstPlace, newBestTime)).toBeTruthy();
            setNewBestTime(oldBestTimes.firstPlace.time.seconds - 1, oldBestTimes.firstPlace.time.minutes - 1);
            expect(BestTimesModifier.updateBestTime(oldBestTimes.firstPlace, newBestTime)).toBeTruthy();
        });

        it('should return false if the new time is longer or equal to the old time', () => {
            setNewBestTime(oldBestTimes.firstPlace.time.seconds, oldBestTimes.firstPlace.time.minutes);
            expect(BestTimesModifier.updateBestTime(oldBestTimes.firstPlace, newBestTime)).toBeFalsy();
            setNewBestTime(oldBestTimes.firstPlace.time.seconds, oldBestTimes.firstPlace.time.minutes + 1);
            expect(BestTimesModifier.updateBestTime(oldBestTimes.firstPlace, newBestTime)).toBeFalsy();
            setNewBestTime(oldBestTimes.firstPlace.time.seconds + 1, oldBestTimes.firstPlace.time.minutes);
            expect(BestTimesModifier.updateBestTime(oldBestTimes.firstPlace, newBestTime)).toBeFalsy();
            setNewBestTime(oldBestTimes.firstPlace.time.seconds + 1, oldBestTimes.firstPlace.time.minutes + 1);
            expect(BestTimesModifier.updateBestTime(oldBestTimes.firstPlace, newBestTime)).toBeFalsy();
        });
    });
});
