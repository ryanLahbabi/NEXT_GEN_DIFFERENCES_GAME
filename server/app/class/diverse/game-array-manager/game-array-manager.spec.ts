import GameArrayManager from '@app/class/diverse/game-array-manager/game-array-manager';
import Game from '@app/class/game-logic/game-interfaces/game-interface';
import Player from '@app/class/game-logic/player/player';
import { GameMode } from '@common/enums/game-play/game-mode';
import * as FakeUsers from './fake-users.json';

class FakeGame extends Game {
    constructor(id: string, gameMode: GameMode) {
        super(undefined);
        this.id = id;
        this.gameMode = gameMode;
    }

    start() {
        this.isOngoing = true;
    }

    findPlayer(): Player {
        return;
    }

    async removePlayer(): Promise<boolean> {
        return;
    }

    disconnectPlayers() {
        return;
    }

    async endGame() {
        return;
    }
}

describe('GameArrayManager', () => {
    let firstGame: FakeGame;
    let secondGame: FakeGame;
    let gameArrayManager: GameArrayManager;

    beforeEach(() => {
        firstGame = new FakeGame(FakeUsers[0].client.id, GameMode.ClassicSolo);
        gameArrayManager = new GameArrayManager();
        gameArrayManager.addGame(firstGame);
    });

    describe('addGame', () => {
        it('should add a game', () => {
            expect(gameArrayManager.getGameAmount).toEqual(1);
        });
    });

    describe('findGame', () => {
        it('should find corresponding game object with its id and return it', () => {
            const returnedGame = gameArrayManager.findGame(FakeUsers[0].client.id);
            expect(returnedGame).toBe(firstGame);
        });

        it('should not find object if no game with the id passed exists as well as return undefined', () => {
            const returnedGame = gameArrayManager.findGame(FakeUsers[1].client.id);
            expect(returnedGame).toBeUndefined();
        });
    });

    describe('removeGame', () => {
        const spyOnFindGame = jest.spyOn(GameArrayManager.prototype, 'findGame');

        afterAll(() => {
            jest.resetAllMocks();
        });

        afterEach(() => {
            expect(spyOnFindGame).toBeCalled();
            jest.clearAllMocks();
        });

        it('should remove game by id and return it and run the endGame function if the game is ongoing', () => {
            firstGame.start();
            spyOnFindGame.mockReturnValue(firstGame);
            const returnedGame = gameArrayManager.removeGame(FakeUsers[0].client.id);
            expect(returnedGame).toBe(firstGame);
            expect(gameArrayManager.getGameAmount).toEqual(0);
        });

        it('should remove game by id and return it and not run the endgame function if the game is not ongoing', () => {
            spyOnFindGame.mockReturnValue(firstGame);
            const returnedGame = gameArrayManager.removeGame(FakeUsers[0].client.id);
            expect(returnedGame).toBe(firstGame);
            expect(gameArrayManager.getGameAmount).toEqual(0);
        });

        it('should not find game with id, thus not removing it and returning undefined', () => {
            spyOnFindGame.mockReturnValue(undefined);
            const returnedGame = gameArrayManager.removeGame(FakeUsers[1].client.id);
            expect(returnedGame).toBeUndefined();
            expect(gameArrayManager.getGameAmount).toEqual(1);
        });
    });

    describe('forEach', () => {
        let visitedGamesArray = [];

        beforeEach(() => {
            secondGame = new FakeGame(FakeUsers[1].client.id, GameMode.ClassicSolo);
            gameArrayManager.addGame(secondGame);
            visitedGamesArray = [];
        });

        it('should affect all games', () => {
            gameArrayManager.forEach((game: Game): boolean => {
                expect(game.getGameMode).toEqual(GameMode.ClassicSolo);
                return false;
            });
        });

        it('should stop looking trough the game array if the passed function returns true, should return true', () => {
            const stoppedLoop = gameArrayManager.forEach((game: Game): boolean => {
                visitedGamesArray.push(game);
                if (game.getId === FakeUsers[0].client.id) return true;
                return false;
            });
            expect(visitedGamesArray.length).toEqual(1);
            expect(stoppedLoop).toBeTruthy();
        });

        it('should not stop looking trough the game array if the passed function never returns true, should return false', () => {
            const stoppedLoop = gameArrayManager.forEach((game: Game): boolean => {
                visitedGamesArray.push(game);
                return false;
            });
            expect(visitedGamesArray.length).toEqual(2);
            expect(stoppedLoop).toBeFalsy();
        });
    });

    describe('findGameByPlayerId', () => {
        const spyOnFindPlayer = jest.spyOn(FakeGame.prototype, 'findPlayer');

        afterAll(() => {
            jest.resetAllMocks();
        });

        afterEach(() => {
            expect(spyOnFindPlayer).toHaveBeenCalled();
            jest.clearAllMocks();
        });

        it('should return the game with the player in it', () => {
            spyOnFindPlayer.mockReturnValue(Player.prototype);
            const foundGame = gameArrayManager.findGameByPlayerId('dummyId');
            expect(foundGame).toBe(firstGame);
        });

        it('should return undefined if no player with the passed id is found', () => {
            spyOnFindPlayer.mockReturnValue(undefined);
            const foundGame = gameArrayManager.findGameByPlayerId('dummyId');
            expect(foundGame).toBeUndefined();
        });
    });

    describe('removePlayerById', () => {
        let spyOnRemovePlayer: jest.SpyInstance;

        beforeAll(() => {
            spyOnRemovePlayer = jest.spyOn(FakeGame.prototype, 'removePlayer');
        });

        afterAll(() => {
            jest.resetAllMocks();
        });

        afterEach(() => {
            expect(spyOnRemovePlayer).toHaveBeenCalled();
            jest.clearAllMocks();
        });

        it('should return true if the player was found and removed', async () => {
            spyOnRemovePlayer.mockResolvedValue(true);
            const removedGame = await gameArrayManager.removePlayerById('dummyId');
            expect(removedGame).toBeTruthy();
        });

        it('should return false if the player was not found and thus not removed', async () => {
            spyOnRemovePlayer.mockResolvedValue(false);
            const removedGame = await gameArrayManager.removePlayerById('dummyId');
            expect(removedGame).toBeFalsy();
        });
    });

    describe('isPlaying', () => {
        let spyOnFindPlayer: jest.SpyInstance;

        beforeAll(() => {
            spyOnFindPlayer = jest.spyOn(FakeGame.prototype, 'findPlayer');
        });

        it('should not find a player', () => {
            spyOnFindPlayer.mockReturnValueOnce(false);
            expect(gameArrayManager.isPlaying(undefined)).toBeFalsy();
        });

        it('should not find a player', () => {
            spyOnFindPlayer.mockReturnValueOnce(true);
            expect(gameArrayManager.isPlaying(undefined)).toBeTruthy();
        });
    });

    describe('empty', () => {
        it('should set the games array to []', () => {
            gameArrayManager.empty();
            expect(gameArrayManager.getGameAmount).toEqual(0);
        });
    });
});
