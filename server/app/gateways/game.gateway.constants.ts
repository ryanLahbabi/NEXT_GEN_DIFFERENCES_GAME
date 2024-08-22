import BestTimesModifier from '@app/class/diverse/best-times-modifier/best-times-modifier';
import { oneMinuteInSeconds, twoMinuteInSeconds } from '@app/class/watch/watch/watch.constants';
import { GameMode } from '@common/enums/game-play/game-mode';
import { BestTimes } from '@common/interfaces/game-card/best-times';
import { Socket } from 'socket.io';

export const GATEWAY_PORT = 2048;

export const RANDOM_NAMES = ['Lucas', 'Zarine', 'Ryan', 'Alexandre', 'Astir', 'Jeremy', 'Saitama', 'Genos', 'Mumen_Rider'];

export interface User {
    name: string;
    client: Socket;
    avatar: string;
}

export interface GameConnectionData {
    gameMode: GameMode;
    cardId: string | undefined;
    user: User;
    gameId?: string;
    playersWithAccess: string[];
}

export const getRandomBestTimes = (): BestTimes => {
    const MIN_SECONDS = 20;
    const basicBestTimes = {
        time: {
            seconds: 0,
            minutes: 100,
        },
        name: undefined,
    };
    const bestTimes: BestTimes = {
        firstPlace: JSON.parse(JSON.stringify(basicBestTimes)),
        secondPlace: JSON.parse(JSON.stringify(basicBestTimes)),
        thirdPlace: JSON.parse(JSON.stringify(basicBestTimes)),
    };
    for (let i = 0; i < 3; i++) {
        const randomTime = Math.floor(Math.random() * twoMinuteInSeconds) + MIN_SECONDS - 1;
        BestTimesModifier.updateBestTimes(bestTimes, {
            name: RANDOM_NAMES[Math.floor(Math.random() * (RANDOM_NAMES.length - 1))],
            time: {
                seconds: randomTime % oneMinuteInSeconds,
                minutes: Math.floor(randomTime / oneMinuteInSeconds),
            },
        });
    }
    return bestTimes;
};
