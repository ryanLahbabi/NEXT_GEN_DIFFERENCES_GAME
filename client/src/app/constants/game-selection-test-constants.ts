import { GameConnectionAttemptResponseType } from '@common/enums/game-play/game-connection-attempt-response-type';
import { BestTimes } from '@common/interfaces/game-card/best-times';
import { GameConnectionRequestOutputMessageDto } from '@common/interfaces/game-play/game-connection-request.dto';
import { GameValues } from '@common/interfaces/game-play/game-values';

export const FAKE_BEST_TIMES: BestTimes = {
    firstPlace: {
        name: 'timmy',
        time: {
            seconds: 0,
            minutes: 3,
        },
    },
    secondPlace: {
        name: 'timmy',
        time: {
            seconds: 0,
            minutes: 3,
        },
    },
    thirdPlace: {
        name: 'timmy',
        time: {
            seconds: 0,
            minutes: 3,
        },
    },
};

export const FAKE_ARGS_STARTING: GameConnectionRequestOutputMessageDto = {
    startingIn: 3,
    time: 3,
    gameName: 'fakeName',
    difficulty: 0,
    modifiedImage: 'fakeImage',
    gameId: 'fakeImage',
    playerNbr: 1,
    originalImage: 'fakeImage',
    differenceNbr: 3,
    hostName: 'Alice',
    responseType: GameConnectionAttemptResponseType.Starting,
    gameValues: {} as GameValues,
};
export const FAKE_ARGS_PENDING: GameConnectionRequestOutputMessageDto = {
    startingIn: 3,
    time: 3,
    gameName: 'fakeName',
    difficulty: 0,
    modifiedImage: 'fakeImage',
    gameId: 'fakeImage',
    playerNbr: 1,
    originalImage: 'fakeImage',
    differenceNbr: 3,
    hostName: 'Alice',
    responseType: GameConnectionAttemptResponseType.Pending,
    gameValues: {} as GameValues,
};
export const FAKE_ARGS_CANCELLED: GameConnectionRequestOutputMessageDto = {
    startingIn: 3,
    time: 3,
    gameName: 'fakeName',
    difficulty: 0,
    modifiedImage: 'fakeImage',
    gameId: 'fakeImage',
    playerNbr: 1,
    originalImage: 'fakeImage',
    differenceNbr: 3,
    hostName: 'Alice',
    responseType: GameConnectionAttemptResponseType.Cancelled,
    gameValues: {} as GameValues,
};
export const FAKE_ARGS_REJECTED: GameConnectionRequestOutputMessageDto = {
    startingIn: 3,
    time: 3,
    gameName: 'fakeName',
    difficulty: 0,
    modifiedImage: 'fakeImage',
    gameId: 'fakeImage',
    playerNbr: 1,
    originalImage: 'fakeImage',
    differenceNbr: 3,
    hostName: 'Alice',
    responseType: GameConnectionAttemptResponseType.Rejected,
    gameValues: {} as GameValues,
};
