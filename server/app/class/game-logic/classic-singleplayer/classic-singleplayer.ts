// import BestTimesModifier from '@app/class/diverse/best-times-modifier/best-times-modifier';
// import FileSystemManager from '@app/class/diverse/file-system-manager/file-system-manager';
// import DifferenceManager from '@app/class/game-logic/difference-manager/difference-manager';
// import Game from '@app/class/game-logic/game-interfaces/game-interface';
// import Player from '@app/class/game-logic/player/player';
// import SinglePlayerGroup from '@app/class/player-groups/solo-player-group/solo-player-group';
// import StopWatch from '@app/class/watch/stopwatch/stopwatch';
// import { oneSecond } from '@app/class/watch/watch/watch.constants';
// import { GameConnectionData } from '@app/gateways/game.gateway.constants';
// import OutputFilterGateway from '@app/gateways/output-filters.gateway';
// import { PlayerRecordDocument } from '@app/model/database-schema/player-record.schema';
// import GameAuthorityService from '@app/services/game-authority/game-authority.service';
// import MongoDBService from '@app/services/mongodb/mongodb.service';
// import { GameConnectionAttemptResponseType } from '@common/enums/game-play/game-connection-attempt-response-type';
// import { GameMode } from '@common/enums/game-play/game-mode';
// import { BestTime } from '@common/interfaces/game-card/best-time';
// import { BestTimes } from '@common/interfaces/game-card/best-times';
// import { Card } from '@common/interfaces/game-card/card';
// import { GameClickOutputDto, GameDifferenceImages } from '@common/interfaces/game-play/game-click.dto';
// import { GameConnectionRequestOutputMessageDto } from '@common/interfaces/game-play/game-connection-request.dto';
// import { EndgameOutputDto } from '@common/interfaces/game-play/game-endgame.dto';
// import { Coordinates } from '@common/interfaces/general/coordinates';
// import { Logger } from '@nestjs/common';

// export default class ClassicSingleplayer extends Game {
//     constructor(mongodbService: MongoDBService) {
//         super(mongodbService);
//         this.gameMode = GameMode.ClassicSolo;
//         this.gameValues = JSON.parse(JSON.stringify(GameAuthorityService.gameValues));
//     }

//     async initialize(data: GameConnectionData): Promise<boolean> {
//         try {
//             this.card = await this.mongodbService.getCardById(data.cardId);
//         } catch (e) {
//             this.card = undefined;
//             Logger.error(e);
//         }
//         onCardReception: if (this.card) {
//             this.id = data.user.client.id;
//             this.cardId = data.cardId;
//             this.cardFiles = FileSystemManager.getImages(this.card);
//             if (!this.cardFiles) break onCardReception;
//             this.playerGroup = new SinglePlayerGroup(data.user, (player: Player) => {
//                 player.differenceManager = new DifferenceManager(this.card, this.cardFiles);
//             });
//             const successMessage: GameConnectionRequestOutputMessageDto = {
//                 responseType: GameConnectionAttemptResponseType.Starting,
//                 gameName: this.card.name,
//                 startingIn: 0,
//                 modifiedImage: this.cardFiles.modifiedImage,
//                 originalImage: this.cardFiles.originalImage,
//                 gameId: this.id,
//                 difficulty: this.card.difficulty,
//                 time: 0,
//                 differenceNbr: this.card.differenceNbr,
//                 playerNbr: 1,
//                 gameValues: this.gameValues,
//                 hostName: this.playerGroup.host.name,
//             };

//             OutputFilterGateway.sendConnectionAttemptResponseMessage.toClient(data.user.client, successMessage);
//             GameAuthorityService.getOngoingGames.addGame(this);
//             this.startGame();
//             return true;
//         }
//         OutputFilterGateway.sendConnectionAttemptResponseMessage.toClient(data.user.client, {
//             responseType: GameConnectionAttemptResponseType.Cancelled,
//             gameId: this.id,
//         } as GameConnectionRequestOutputMessageDto);
//         return false;
//     }

//     startGame() {
//         this.gameWatch = new StopWatch();
//         this.gameWatch.eachInterval = () => OutputFilterGateway.sendTime.toLobby(this.playerGroup.getLobbyId, this.gameWatch.getTicks);
//         this.gameWatch.start();
//         this.isOngoing = true;
//     }

//     async endGame(winner?: Player) {
//         GameAuthorityService.getOngoingGames.removeGame(this.id);
//         if (this.isOngoing) {
//             this.isOngoing = false;
//             this.gameWatch.pause();
//             let players: PlayerRecordDocument[];
//             if (winner) {
//                 players = this.getPlayerList([winner]);
//                 const endMessage: EndgameOutputDto = {
//                     finalTime: this.gameWatch.getSeconds,
//                     players,
//                 };
//                 const newBestTime: BestTime = {
//                     name: winner.name,
//                     time: this.gameWatch.getTime,
//                 };
//                 const card = await this.mongodbService.getCardById(this.cardId);
//                 if (card) {
//                     const bestTimeId = BestTimesModifier.updateBestTimes(card.classicSoloBestTimes, newBestTime);
//                     if (bestTimeId) {
//                         endMessage.newBestTimes = card.classicSoloBestTimes as BestTimes;
//                         OutputFilterGateway.sendGlobalMessage.toServer(
//                             winner.name + ' obtient la ' + bestTimeId + ' place dans les meilleurs temps du jeu ' + card.name + ' en Classique Solo',
//                         );
//                         OutputFilterGateway.sendRecordBeaterMessage.toLobby(
//                             this.playerGroup.getLobbyId,
//                             winner.name +
//                                 ' tu as obtenu la ' +
//                                 bestTimeId +
//                                 ' place dans les meilleurs temps du jeu ' +
//                                 card.name +
//                                 ' en Classique Solo !',
//                         );
//                         const newTimes: Card = { classicSoloBestTimes: card.classicSoloBestTimes } as Card;
//                         this.mongodbService
//                             .modifyCard(this.cardId, newTimes)
//                             .then(() => {
//                                 newTimes.id = this.cardId;
//                                 OutputFilterGateway.sendCardTimes.toServer(newTimes);
//                             })
//                             .catch((e) => Logger.error(e));
//                     }
//                 }
//                 OutputFilterGateway.sendEndgameMessage.toLobby(this.playerGroup.getLobbyId, endMessage);
//             } else players = this.getPlayerList([]);
//             const record = {
//                 players,
//                 startDate: this.startTime,
//                 duration: this.gameWatch.getTime,
//                 gameMode: this.gameMode,
//             };
//             this.mongodbService
//                 .addPlayerRecord(record)
//                 .then(() => OutputFilterGateway.sendRecord.toServer(record))
//                 .catch((e) => Logger.error(e));
//         }
//         this.playerGroup.empty();
//     }

//     async removePlayer(playerId: string): Promise<boolean> {
//         const removedPlayer = this.playerGroup.leave(playerId, this.isOngoing) !== undefined;
//         if (removedPlayer) this.endGame();
//         return removedPlayer;
//     }

//     verifyClick(playerId: string, clickCoordinates: Coordinates): boolean {
//         return super.verifyClick(playerId, clickCoordinates, (foundDifferenceValues: GameDifferenceImages, player: Player) => {
//             if (foundDifferenceValues) {
//                 const validClickResponse: GameClickOutputDto = {
//                     valid: true,
//                     differenceNaturalOverlay: foundDifferenceValues.differenceNaturalOverlay,
//                     differenceFlashOverlay: foundDifferenceValues.differenceFlashOverlay,
//                 };
//                 OutputFilterGateway.sendClickResponseMessage.toClient(player.client, validClickResponse);
//                 player.differencesFound++;
//                 OutputFilterGateway.sendCheatIndex.toLobby(this.playerGroup.getLobbyId, foundDifferenceValues.index);
//                 if (player.differenceManager.foundAllDifferences()) this.endGame(player);
//                 return true;
//             }
//             const invalidClickResponse: GameClickOutputDto = {
//                 valid: false,
//                 penaltyTime: oneSecond,
//             };
//             OutputFilterGateway.sendClickResponseMessage.toClient(player.client, invalidClickResponse);
//             player.startPenalty(oneSecond);
//             return false;
//         });
//     }
// }
