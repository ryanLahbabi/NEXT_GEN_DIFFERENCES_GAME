/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
import { GameMode } from '@common/enums/game-play/game-mode';

describe('restore', () => {
    it('should restore a test', () => {
        const present = {
            fn: jest.fn().mockResolvedValue('result'),
            val: 'val',
        };
        const solid = {
            fn: jest.fn(),
            val: undefined,
        };
        TEST.restore(present, solid);
        expect(present.fn()).toBeUndefined();
        expect(present.val).toBeUndefined();
    });
});

export namespace TEST {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const restore = (present: object, solid: object) => {
        for (const key of Object.keys(present)) {
            try {
                present[key].mockRestore();
            } catch (e) {
                present[key] = solid[key];
            }
        }
    };

    export const reset = () => {
        restore(DIFFERENCE_LOCATOR.MOCK, DIFFERENCE_LOCATOR.SOLID_MOCK);
        restore(GAME_ARRAY_MANAGER.MOCK, GAME_ARRAY_MANAGER.SOLID_MOCK);
        restore(DIFFERENCE_MANAGER.MOCK, DIFFERENCE_MANAGER.SOLID_MOCK);
        restore(GAME_INTERFACE.MOCK, GAME_INTERFACE.SOLID_MOCK);
        restore(CLASSIC_SINGLEPLAYER.MOCK, CLASSIC_SINGLEPLAYER.SOLID_MOCK);
        restore(CLASSIC_1V1.MOCK, CLASSIC_1V1.SOLID_MOCK);
        restore(PLAYER.MOCK, PLAYER.SOLID_MOCK);
        restore(TIMER.MOCK, TIMER.SOLID_MOCK);
        restore(STOPWATCH.MOCK, STOPWATCH.SOLID_MOCK);
        restore(LOBBY.MOCK, LOBBY.SOLID_MOCK);
        restore(SOLO_LOBBY.MOCK, SOLO_LOBBY.SOLID_MOCK);
        restore(DUO_LOBBY.MOCK, DUO_LOBBY.SOLID_MOCK);
        restore(MONGODB_SERVICE.MOCK, MONGODB_SERVICE.SOLID_MOCK);
        restore(LIMITED_TIME_COOP.MOCK, LIMITED_TIME_COOP.SOLID_MOCK);
        restore(LIMITED_TIME_SOLO.MOCK, LIMITED_TIME_SOLO.SOLID_MOCK);
        restore(LIMITED_TIME.MOCK, LIMITED_TIME.SOLID_MOCK);
    };

    export namespace DIFFERENCE_LOCATOR {
        export const SOLID_MOCK = {
            getDifficulty: jest.fn(),
            getValidationData: jest.fn(),
            getCreationData: jest.fn(),
            findDifferences: jest.fn(),
            resetAlgorithmData: jest.fn(),
            setImages: jest.fn(),
            setSphereValues: jest.fn(),
            updateActiveLines: jest.fn(),
            updateFollowingLines: jest.fn(),
            comparePixels: jest.fn(),
            getDifferenceNbr: undefined,
            getRadius: undefined,
            getSphereValues: undefined,
        };

        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace GAME_ARRAY_MANAGER {
        export const SOLID_MOCK = {
            addGame: jest.fn(),
            findGame: jest.fn(),
            removeGame: jest.fn(),
            forEach: jest.fn(),
            findGameByPlayerId: jest.fn(),
            removePlayerById: jest.fn(),
            isPlaying: jest.fn(),
            empty: jest.fn(),
            getGameAmount: undefined,
        };
        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace DIFFERENCE_MANAGER {
        export const SOLID_MOCK = {
            getUsedHintNbr: undefined,
            originalDifferenceAmount: undefined,
            getFoundDifferenceNbr: undefined,
            cheatFlashImages: undefined,
            hint: undefined,
            foundAllDifferences: jest.fn(),
            removeDifferenceByIndex: jest.fn(),
            findDifference: jest.fn(),
        };
        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace GAME_INTERFACE {
        export const SOLID_MOCK = {
            initialize: jest.fn(),
            startGame: jest.fn(),
            endGame: jest.fn(),
            join: jest.fn(),
            removePlayer: jest.fn(),
            verifyClick: jest.fn(),
            findPlayer: jest.fn(),
            getLobbyIds: jest.fn(),
            getPlayerList: jest.fn(),
            getHint: jest.fn(),
            host: undefined,
            getCardId: undefined,
            getGameMode: undefined,
            getId: undefined,
            getIsOngoing: undefined,
        };

        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace CLASSIC_SINGLEPLAYER {
        export const SOLID_MOCK = {
            ...GAME_INTERFACE.SOLID_MOCK,
            kickWaitingPlayer: jest.fn(),
            getGameMode: GameMode.ClassicSolo,
        };

        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace CLASSIC_1V1 {
        export const SOLID_MOCK = {
            ...GAME_INTERFACE.SOLID_MOCK,
            kickWaitingPlayer: jest.fn(),
            getGameMode: GameMode.Classic1v1,
        };

        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace PLAYER {
        export const SOLID_MOCK = {
            startPenalty: jest.fn(),
        };
        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace MONGODB_SERVICE {
        export const SOLID_MOCK = {
            start: jest.fn(),
            populateDB: jest.fn(),
            getAllCardIds: jest.fn(),
            getAllCardPreviews: jest.fn(),
            getCardById: jest.fn(),
            addCard: jest.fn(),
            removeCardById: jest.fn(),
            removeAllCards: jest.fn(),
            removeAllRecords: jest.fn(),
            modifyCard: jest.fn(),
            addPlayerRecord: jest.fn(),
            getAllRecords: jest.fn(),
            resetAllBestTimes: jest.fn(),
            resetBestTimesByCardId: jest.fn(),
            getCardPreviewById: jest.fn(),
        };

        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace WATCH {
        export const SOLID_MOCK = {
            getTime: undefined,
            getSeconds: undefined,
            isPaused: undefined,
            getIntervalFunction: jest.fn(),
            start: jest.fn(),
            set: jest.fn(),
            pause: jest.fn(),
            add: jest.fn(),
            remove: jest.fn(),
            hasMoreTimeThan: jest.fn(),
            hasNoTime: jest.fn(),
            filter: jest.fn(),
            reset: jest.fn(),
        };
    }

    export namespace TIMER {
        export const SOLID_MOCK = { ...WATCH.SOLID_MOCK };

        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace STOPWATCH {
        export const SOLID_MOCK = { ...WATCH.SOLID_MOCK };

        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace LOBBY {
        export const SOLID_MOCK = {
            joinUser: jest.fn(),
            joinPlayer: jest.fn(),
            leave: jest.fn(),
            transferPlayerTo: jest.fn(),
            getPlayer: jest.fn(),
            getPlayerByIndex: jest.fn(),
            isPlayerPresent: jest.fn(),
            empty: jest.fn(),
            forEachPlayer: jest.fn(),
            getDeserters: undefined,
            getPlayerNbr: undefined,
            isValid: undefined,
            getId: undefined,
            host: undefined,
        };

        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace SOLO_LOBBY {
        export const SOLID_MOCK = { ...LOBBY.SOLID_MOCK };

        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace DUO_LOBBY {
        export const SOLID_MOCK = { ...LOBBY.SOLID_MOCK };

        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace LIMITED_TIME {
        export const SOLID_MOCK = {
            ...GAME_INTERFACE.SOLID_MOCK,
            addCardId: jest.fn(),
            getRandomCard: jest.fn(),
            shiftCards: jest.fn(),
        };

        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace LIMITED_TIME_COOP {
        export const SOLID_MOCK = {
            ...LIMITED_TIME.SOLID_MOCK,
        };

        export let MOCK = { ...SOLID_MOCK };
    }

    export namespace LIMITED_TIME_SOLO {
        export const SOLID_MOCK = {
            ...LIMITED_TIME.SOLID_MOCK,
        };

        export let MOCK = { ...SOLID_MOCK };
    }
}
