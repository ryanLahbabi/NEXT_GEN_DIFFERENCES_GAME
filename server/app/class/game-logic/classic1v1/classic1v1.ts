// import BestTimesModifier from '@app/class/diverse/best-times-modifier/best-times-modifier';
// import FileSystemManager from '@app/class/diverse/file-system-manager/file-system-manager';
// import DifferenceManager from '@app/class/game-logic/difference-manager/difference-manager';
// import Game from '@app/class/game-logic/game-interfaces/game-interface';
// import Player from '@app/class/game-logic/player/player';
// import PlayerGroup from '@app/class/player-groups/default-player-group/player-group';
// import DuoPlayerGroup from '@app/class/player-groups/duo-player-group/duo-player-group';
// import StopWatch from '@app/class/watch/stopwatch/stopwatch';
// import { oneSecond } from '@app/class/watch/watch/watch.constants';
// import { GameConnectionData, User } from '@app/gateways/game.gateway.constants';
// import OutputFilterGateway from '@app/gateways/output-filters.gateway';
// import GameAuthorityService from '@app/services/game-authority/game-authority.service';
// import MongoDBService from '@app/services/mongodb/mongodb.service';
// import { GameConnectionAttemptResponseType } from '@common/enums/game-play/game-connection-attempt-response-type';
// import { GameMode } from '@common/enums/game-play/game-mode';
// import { PlayerConnectionStatus } from '@common/enums/game-play/player-connection-status';
// import { BestTime } from '@common/interfaces/game-card/best-time';
// import { BestTimes } from '@common/interfaces/game-card/best-times';
// import { Card } from '@common/interfaces/game-card/card';
// import { GameClickOutputDto, GameDifferenceImages } from '@common/interfaces/game-play/game-click.dto';
// import { GameConnectionRequestOutputMessageDto } from '@common/interfaces/game-play/game-connection-request.dto';
// import { EndgameOutputDto } from '@common/interfaces/game-play/game-endgame.dto';
// import { Coordinates } from '@common/interfaces/general/coordinates';
// import { Logger } from '@nestjs/common';

// export default class Classic1v1 extends Game {
//     protected waitingLobby: PlayerGroup;

//     constructor(mongodbService: MongoDBService) {
//         super(mongodbService);
//         this.gameMode = GameMode.Classic1v1;
//     }

//     async initialize(data: GameConnectionData): Promise<boolean> {
//         const maxWaitingPlayers = 10;
//         try {
//             this.card = await this.mongodbService.getCardById(data.cardId);
//         } catch (e) {
//             this.card = undefined;
//             Logger.error(e);
//         }
//         onCardReception: if (this.card) {
//             this.cardId = data.cardId;
//             this.id = data.user.client.id;
//             this.cardFiles = FileSystemManager.getImages(this.card);
//             if (!this.cardFiles) break onCardReception;
//             this.playerGroup = new DuoPlayerGroup(data.user);
//             this.waitingLobby = new PlayerGroup(0, maxWaitingPlayers);
//             const waitingMessage: GameConnectionRequestOutputMessageDto = {
//                 responseType: GameConnectionAttemptResponseType.Pending,
//                 gameId: this.id,
//                 playerNbr: 1,
//             } as GameConnectionRequestOutputMessageDto;
//             OutputFilterGateway.sendConnectionAttemptResponseMessage.toClient(data.user.client, waitingMessage);
//             GameAuthorityService.getPendingGames.addGame(this);
//             return true;
//         }
//         OutputFilterGateway.sendConnectionAttemptResponseMessage.toClient(data.user.client, {
//             responseType: GameConnectionAttemptResponseType.Cancelled,
//             gameId: this.id,
//         } as GameConnectionRequestOutputMessageDto);
//         return false;
//     }

//     startGame(clientId: string) {
//         if (!this.waitingLobby.transferPlayerTo(clientId, this.playerGroup)) return;
//         this.waitingLobby.forEachPlayer((player: Player) => {
//             OutputFilterGateway.sendConnectionAttemptResponseMessage.toClient(player.client, {
//                 responseType: GameConnectionAttemptResponseType.Rejected,
//                 gameId: this.id,
//             } as GameConnectionRequestOutputMessageDto);
//             return false;
//         });
//         this.waitingLobby.empty();
//         this.playerGroup.forEachPlayer((player: Player) => {
//             player.differenceManager = new DifferenceManager(this.card, this.cardFiles);
//             return false;
//         });
//         GameAuthorityService.startGame(this.id);
//         this.isOngoing = true;
//         const startMessage: GameConnectionRequestOutputMessageDto = {
//             responseType: GameConnectionAttemptResponseType.Starting,
//             gameName: this.card.name,
//             startingIn: 0,
//             modifiedImage: this.cardFiles.modifiedImage,
//             originalImage: this.cardFiles.originalImage,
//             gameId: this.id,
//             difficulty: this.card.difficulty,
//             time: 0,
//             differenceNbr: this.card.differenceNbr,
//             playerNbr: 2,
//             hostName: this.playerGroup.host.name,
//             gameValues: undefined,
//         };
//         OutputFilterGateway.sendConnectionAttemptResponseMessage.toLobby(this.playerGroup.getLobbyId, startMessage);
//         this.gameWatch = new StopWatch();
//         this.gameWatch.eachInterval = () => OutputFilterGateway.sendTime.toLobby(this.playerGroup.getLobbyId, this.gameWatch.getTicks);
//         this.gameWatch.start();
//     }

//     join(user: User): boolean {
//         if (!this.isOngoing) {
//             const joinedWaitingLobby = this.waitingLobby.joinUser(user);
//             if (joinedWaitingLobby) {
//                 OutputFilterGateway.sendConnectionAttemptResponseMessage.toClient(user.client, {
//                     responseType: GameConnectionAttemptResponseType.Pending,
//                     gameId: this.id,
//                 } as GameConnectionRequestOutputMessageDto);
//                 OutputFilterGateway.sendPlayerConnectionMessage.toClient(this.playerGroup.host.client, {
//                     playerConnectionStatus: PlayerConnectionStatus.AttemptingToJoin,
//                     user: {
//                         name: user.name,
//                         id: user.client.id,
//                     },
//                 });
//             }
//             return joinedWaitingLobby;
//         }
//         return false;
//     }

//     async endGame(winner?: Player) {
//         if (this.isOngoing) {
//             GameAuthorityService.getOngoingGames.removeGame(this.id);
//             this.isOngoing = false;
//             this.gameWatch.pause();
//             const endMessage: EndgameOutputDto = {
//                 finalTime: this.gameWatch.getSeconds,
//                 players: this.getPlayerList(winner ? [winner] : []),
//             };
//             if (winner) {
//                 const newBestTime: BestTime = {
//                     name: winner.name,
//                     time: this.gameWatch.getTime,
//                 };
//                 const card = await this.mongodbService.getCardById(this.cardId);
//                 if (card) {
//                     const bestTimeId = BestTimesModifier.updateBestTimes(card.classic1v1BestTimes, newBestTime);
//                     if (bestTimeId) {
//                         endMessage.newBestTimes = card.classic1v1BestTimes as BestTimes;
//                         OutputFilterGateway.sendGlobalMessage.toServer(
//                             winner.name + ' obtient la ' + bestTimeId + ' place dans les meilleurs temps du jeu ' + card.name + ' en Classique 1v1',
//                         );
//                         OutputFilterGateway.sendRecordBeaterMessage.toLobby(
//                             this.playerGroup.getLobbyId,
//                             'Avec cette victoire, ' +
//                                 winner.name +
//                                 ' obtient la ' +
//                                 bestTimeId +
//                                 ' place dans les meilleurs temps du jeu ' +
//                                 card.name +
//                                 ' en Classique 1v1',
//                         );

//                         const newTimes: Card = { classic1v1BestTimes: card.classic1v1BestTimes } as unknown as Card;
//                         this.mongodbService
//                             .modifyCard(this.cardId, newTimes)
//                             .then(() => {
//                                 newTimes.id = this.cardId;
//                                 OutputFilterGateway.sendCardTimes.toServer(newTimes);
//                             })
//                             .catch((e) => Logger.error(e));
//                     }
//                 }
//             }
//             OutputFilterGateway.sendEndgameMessage.toLobby(this.playerGroup.getLobbyId, endMessage);
//             const record = {
//                 players: endMessage.players,
//                 startDate: this.startTime,
//                 duration: this.gameWatch.getTime,
//                 gameMode: this.gameMode,
//             };
//             this.mongodbService
//                 .addPlayerRecord(record)
//                 .then(() => OutputFilterGateway.sendRecord.toServer(record))
//                 .catch((e) => Logger.error(e));
//         } else {
//             GameAuthorityService.removeJoinableGames(this.id);
//             GameAuthorityService.getPendingGames.removeGame(this.id);
//             const cancelMessage = {
//                 responseType: GameConnectionAttemptResponseType.Cancelled,
//                 gameId: this.id,
//             } as GameConnectionRequestOutputMessageDto;
//             OutputFilterGateway.sendConnectionAttemptResponseMessage.toLobby(this.playerGroup.getLobbyId, cancelMessage);
//             OutputFilterGateway.sendConnectionAttemptResponseMessage.toLobby(this.waitingLobby.getLobbyId, cancelMessage);
//         }
//         this.playerGroup.empty();
//         this.waitingLobby.empty();
//     }

//     kickWaitingPlayer(playerId: string) {
//         const player = this.waitingLobby.leave(playerId, false);
//         if (player) {
//             OutputFilterGateway.sendConnectionAttemptResponseMessage.toClient(player.client, {
//                 responseType: GameConnectionAttemptResponseType.Rejected,
//                 gameId: this.id,
//             } as GameConnectionRequestOutputMessageDto);
//             OutputFilterGateway.sendPlayerConnectionMessage.toClient(this.playerGroup.host.client, {
//                 playerConnectionStatus: PlayerConnectionStatus.Left,
//                 user: {
//                     name: player.name,
//                     id: player.client.id,
//                 },
//             });
//         }
//     }

//     async removePlayer(playerId: string): Promise<boolean> {
//         let removedPlayer = this.playerGroup.leave(playerId, this.isOngoing);
//         if (removedPlayer) {
//             if (this.isOngoing) OutputFilterGateway.sendDeserterMessage.toLobby(this.playerGroup.getLobbyId, removedPlayer.name);
//             this.endGame();
//             return true;
//         } else if (!this.isOngoing) {
//             removedPlayer = this.waitingLobby.leave(playerId, false);
//             if (removedPlayer) {
//                 OutputFilterGateway.sendPlayerConnectionMessage.toClient(this.playerGroup.host.client, {
//                     playerConnectionStatus: PlayerConnectionStatus.Left,
//                     user: {
//                         name: removedPlayer.name,
//                         id: removedPlayer.client.id,
//                     },
//                 });
//             }
//         }
//         return removedPlayer !== undefined;
//     }

//     verifyClick(playerId: string, clickCoordinates: Coordinates): boolean {
//         return super.verifyClick(playerId, clickCoordinates, (foundDifferenceValues: GameDifferenceImages, player: Player) => {
//             if (foundDifferenceValues) {
//                 const validClickResponse: GameClickOutputDto = {
//                     valid: true,
//                     differenceNaturalOverlay: foundDifferenceValues.differenceNaturalOverlay,
//                     differenceFlashOverlay: foundDifferenceValues.differenceFlashOverlay,
//                 };
//                 this.playerGroup.forEachPlayer((p: Player): boolean => {
//                     p.differenceManager.removeDifferenceByIndex(foundDifferenceValues.index, false);
//                     return false;
//                 });
//                 OutputFilterGateway.sendClickResponseMessage.toClient(player.client, validClickResponse);
//                 OutputFilterGateway.sendOtherClick.broadcast(
//                     player.client,
//                     {
//                         playerName: player.name,
//                         valid: true,
//                         differenceNaturalOverlay: foundDifferenceValues.differenceNaturalOverlay,
//                         differenceFlashOverlay: foundDifferenceValues.differenceFlashOverlay,
//                     },
//                     this.playerGroup.getLobbyId,
//                 );
//                 player.differencesFound++;
//                 OutputFilterGateway.sendCheatIndex.toLobby(this.playerGroup.getLobbyId, foundDifferenceValues.index);
//                 if (player.differenceManager.getFoundDifferenceNbr >= Math.ceil(player.differenceManager.originalDifferenceAmount / 2))
//                     this.endGame(player);
//                 return true;
//             }
//             OutputFilterGateway.sendOtherClick.broadcast(
//                 player.client,
//                 {
//                     playerName: player.name,
//                     valid: false,
//                 },
//                 this.playerGroup.getLobbyId,
//             );
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
