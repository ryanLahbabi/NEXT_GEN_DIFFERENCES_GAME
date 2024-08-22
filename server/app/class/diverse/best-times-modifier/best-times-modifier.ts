import { BestTime } from '@common/interfaces/game-card/best-time';
import { BestTimes } from '@common/interfaces/game-card/best-times';

export default class BestTimesModifier {
    static updateBestTimes(bestTimes: BestTimes, newTime: BestTime): string {
        if (!bestTimes || !newTime) return undefined;
        if (BestTimesModifier.updateBestTime(bestTimes.firstPlace, newTime)) {
            bestTimes.thirdPlace = bestTimes.secondPlace;
            bestTimes.secondPlace = bestTimes.firstPlace;
            bestTimes.firstPlace = newTime;
            return 'première';
        } else if (BestTimesModifier.updateBestTime(bestTimes.secondPlace, newTime)) {
            bestTimes.thirdPlace = bestTimes.secondPlace;
            bestTimes.secondPlace = newTime;
            return 'seconde';
        } else if (BestTimesModifier.updateBestTime(bestTimes.thirdPlace, newTime)) {
            bestTimes.thirdPlace = newTime;
            return 'troisième';
        }
        return undefined;
    }

    static updateBestTime(oldBestTime: BestTime, newBestTime: BestTime): boolean {
        if (newBestTime.time.minutes < oldBestTime.time.minutes) return true;
        else if (newBestTime.time.minutes === oldBestTime.time.minutes && newBestTime.time.seconds < oldBestTime.time.seconds) return true;
        return false;
    }
}
