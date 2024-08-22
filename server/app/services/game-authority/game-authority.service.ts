import GameArrayManager from '@app/class/diverse/game-array-manager/game-array-manager';
import { Error } from '@app/class/error-management/error.constants';
import ClassicDeathMatch from '@app/class/game-logic/classic-death-match/classic-death-match';
import Game from '@app/class/game-logic/game-interfaces/game-interface';
import { GAME_VALUES } from '@app/class/game-logic/game-logic.constants';
import LimitedTimeDeathMatch from '@app/class/game-logic/limited-time-death-match/limited-time-death-match';
import GameGateway from '@app/gateways/game.gateway';
import { GameConnectionData } from '@app/gateways/game.gateway.constants';
import OutputFilterGateway from '@app/gateways/output-filters.gateway';
import MongoDBService from '@app/services/mongodb/mongodb.service';
import { GameInfo } from '@common/dto/game/game-info.dto';
import { GameMode } from '@common/enums/game-play/game-mode';
import { GameValues } from '@common/interfaces/game-play/game-values';

export default class GameAuthorityService {
    static mongoDBService: MongoDBService;
    static gameGateway: GameGateway;
    static joinableGames: GameInfo[] = [];
    static gameValues: GameValues = GAME_VALUES;
    static validCards: string[] = [];
    private static ongoingGames = new GameArrayManager();
    private static pendingGames = new GameArrayManager();

    static get getOngoingGames(): GameArrayManager {
        return this.ongoingGames;
    }

    static get getPendingGames(): GameArrayManager {
        return this.pendingGames;
    }

    static async connect(connectionData: GameConnectionData) {
        const validGameMode = connectionData.gameMode === GameMode.ClassicDeathMatch || connectionData.gameMode === GameMode.LimitedTimeDeathMatch;
        const gameModeString = connectionData.gameMode > GameMode.None ? 'ENUM_TYPE_OUT_OF_SCOPE' : GameMode[connectionData.gameMode];
        Error.Game.BAD_GAMEMODE.generateErrorIf(!validGameMode).formatMessage(gameModeString);
        if (this.isPlaying(connectionData.user.client.id)) return;
        if (this.joinPendingGame(connectionData)) return;
        let game: Game;

        switch (connectionData.gameMode) {
            case GameMode.ClassicDeathMatch:
                game = new ClassicDeathMatch(this.mongoDBService);
                if (game.initialize(connectionData)) {
                    const gameInfo: GameInfo = {
                        id: game.getId,
                        gameMode: game.getGameMode,
                        cardId: game.getCardId,
                        waitingPlayers: [connectionData.user.name],
                        observerNbr: 0,
                        playersWithAccess: connectionData.playersWithAccess,
                    };
                    this.joinableGames.push(gameInfo);
                    OutputFilterGateway.sendJoinableGames.toServer(this.joinableGames);
                }
                break;
            case GameMode.LimitedTimeDeathMatch:
                game = new LimitedTimeDeathMatch(this.mongoDBService);
                if (game.initialize(connectionData)) {
                    const gameInfo: GameInfo = {
                        id: game.getId,
                        gameMode: game.getGameMode,
                        waitingPlayers: [connectionData.user.name],
                        observerNbr: 0,
                        playersWithAccess: connectionData.playersWithAccess,
                    };
                    this.joinableGames.push(gameInfo);
                    OutputFilterGateway.sendJoinableGames.toServer(this.joinableGames);
                }
                break;

            case GameMode.ClassicSolo:
            case GameMode.LimitedTimeCoop:
            case GameMode.LimitedTimeSolo:
            default:
                Error.Game.UNAUTHORIZED_ACTION.generateErrorIf(true).overrideMessage(
                    `GameMode '${GameMode[connectionData.gameMode]}' not authorized.`,
                );
        }
    }

    static removeJoinableGames(gameId: string) {
        for (let i = 0; i < this.joinableGames.length; i++)
            if (this.joinableGames[i].id === gameId) {
                this.joinableGames.splice(i, 1);
                OutputFilterGateway.sendJoinableGames.toServer(this.joinableGames);
            }
    }

    static startGame(gameId: string): void {
        const startingGame = this.pendingGames.removeGame(gameId);
        if (startingGame !== undefined) {
            this.removeJoinableGames(gameId);
            this.ongoingGames.addGame(startingGame);
        }
    }

    static isPlaying(playerId: string) {
        return this.ongoingGames.isPlaying(playerId) || this.pendingGames.isPlaying(playerId);
    }

    static removePlayer(playerId: string) {
        this.ongoingGames.removePlayerById(playerId);
        this.pendingGames.removePlayerById(playerId);
    }

    static joinPendingGame(data: GameConnectionData): boolean {
        if (!data.gameId) return false;
        const func: (game: Game) => boolean = (game: Game): boolean => {
            if (game.getGameMode === data.gameMode && data.gameId === game.getId)
                if (game.join(data.user)) {
                    this.joinableGames.forEach((g) => {
                        if (g.id === data.gameId) g.waitingPlayers.push(data.user.name);
                    });
                    OutputFilterGateway.sendJoinableGames.toServer(this.joinableGames);
                    return true;
                }
            return false;
        };
        const hasJoined = this.pendingGames.forEach(func);
        Error.Game.GAME_NOT_FOUND.generateErrorIf(!hasJoined).formatMessage(data.gameId);
        return true;
    }
}
