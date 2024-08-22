import DifferenceManager from '@app/class/game-logic/difference-manager/difference-manager';
import Timer from '@app/class/watch/timer/timer';
import { User } from '@app/gateways/game.gateway.constants';
import { Socket } from 'socket.io';

export default class Player {
    name: string;
    client: Socket;
    differencesFound = 0;
    differenceManager: DifferenceManager | undefined;
    avatar: string;
    protected penaltyTimer: Timer;

    constructor(user: User, public downTime = false) {
        this.name = user.name;
        this.client = user.client;
        this.penaltyTimer = new Timer();
    }

    startPenalty(seconds: number, onEnd?: () => void) {
        if (this.downTime && this.penaltyTimer.hasMoreTimeThan(seconds)) return;
        this.downTime = true;
        this.penaltyTimer.onEnd = () => {
            this.downTime = false;
            if (onEnd) onEnd();
        };
        this.penaltyTimer.set(seconds).start();
    }
}
