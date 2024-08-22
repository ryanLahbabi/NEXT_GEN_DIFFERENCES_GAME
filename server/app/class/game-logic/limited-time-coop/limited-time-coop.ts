// import DifferenceManager from '@app/class/game-logic/difference-manager/difference-manager';
// import LimitedTime from '@app/class/game-logic/game-interfaces/limited-time-interface';
// import Player from '@app/class/game-logic/player/player';
// import DuoPlayerGroup from '@app/class/player-groups/duo-player-group/duo-player-group';
// import Timer from '@app/class/watch/timer/timer';
// import { GameConnectionData, User } from '@app/gateways/game.gateway.constants';
// import OutputFilterGateway from '@app/gateways/output-filters.gateway';
// import GameAuthorityService from '@app/services/game-authority/game-authority.service';
// import MongoDBService from '@app/services/mongodb/mongodb.service';
// import { GameConnectionAttemptResponseType } from '@common/enums/game-play/game-connection-attempt-response-type';
// import { GameMode } from '@common/enums/game-play/game-mode';
// import { PlayerConnectionStatus } from '@common/enums/game-play/player-connection-status';
// import { GameConnectionRequestOutputMessageDto } from '@common/interfaces/game-play/game-connection-request.dto';
// import { EndgameOutputDto } from '@common/interfaces/game-play/game-endgame.dto';
// import { Logger } from '@nestjs/common';

// export default class LimitedTimeCoop extends LimitedTime {
//     constructor(mongodbService: MongoDBService) {
//         super(mongodbService);
//         this.gameMode = GameMode.LimitedTimeCoop;
//         this.gameValues = JSON.parse(JSON.stringify(GameAuthorityService.gameValues));
//     }

//     async initialize(data: GameConnectionData): Promise<boolean> {
//         if (await this.fetchInitialCards()) {
//             this.id = data.user.client.id;
//             this.cardId = data.cardId;
//             this.playerGroup = new DuoPlayerGroup(data.user);
//             this.shiftCards();
//             this.differenceManager = new DifferenceManager(this.card, this.cardFiles);
//             this.playerGroup.host.differenceManager = this.differenceManager;
//             const successMessage: GameConnectionRequestOutputMessageDto = {
//                 responseType: GameConnectionAttemptResponseType.Pending,
//                 gameName: this.card.name,
//                 startingIn: 0,
//                 modifiedImage: this.cardFiles.modifiedImage,
//                 originalImage: this.cardFiles.originalImage,
//                 gameId: this.id,
//                 difficulty: this.card.difficulty,
//                 time: this.gameValues.timerTime,
//                 differenceNbr: this.card.differenceNbr,
//                 playerNbr: 1,
//             } as GameConnectionRequestOutputMessageDto;

//             OutputFilterGateway.sendConnectionAttemptResponseMessage.toClient(data.user.client, successMessage);
//             GameAuthorityService.getPendingGames.addGame(this);
//             return true;
//         }
//         OutputFilterGateway.sendConnectionAttemptResponseMessage.toClient(data.user.client, {
//             responseType: GameConnectionAttemptResponseType.Cancelled,
//             gameId: this.id,
//         } as GameConnectionRequestOutputMessageDto);
//         return false;
//     }

//     startGame() {
//         this.playerGroup.forEachPlayer((player: Player) => {
//             player.differenceManager = new DifferenceManager(this.card, this.cardFiles);
//             return false;
//         });
//         GameAuthorityService.startGame(this.id);
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
//             gameValues: this.gameValues,
//         };
//         OutputFilterGateway.sendConnectionAttemptResponseMessage.toLobby(this.playerGroup.getLobbyId, startMessage);
//         this.gameWatch = new Timer();
//         this.gameWatch.eachInterval = () => OutputFilterGateway.sendTime.toLobby(this.playerGroup.getLobbyId, this.gameWatch.getSeconds);

//         this.gameWatch.onEnd = async () => this.endGame();
//         this.gameTimer.start();
//         this.gameWatch.set(this.gameValues.timerTime);
//         this.gameWatch.start();
//         if (this.upcomingCards[0])
//             OutputFilterGateway.sendNextCard.toLobby(this.playerGroup.getLobbyId, {
//                 name: this.upcomingCards[0].data.name,
//                 originalImage: this.upcomingCards[0].files.originalImage,
//                 modifiedImage: this.upcomingCards[0].files.modifiedImage,
//                 nbDifferences: this.upcomingCards[0].data.differenceNbr,
//             });
//         this.isOngoing = true;
//     }

//     async endGame() {
//         if (this.isOngoing) {
//             GameAuthorityService.getOngoingGames.removeGame(this.id);
//             this.isOngoing = false;
//             this.gameWatch.pause();
//             this.gameTimer.pause();
//             const players = this.getPlayerList([]);
//             const endMessage: EndgameOutputDto = {
//                 finalTime: this.gameWatch.getSeconds,
//                 players,
//             };
//             OutputFilterGateway.sendEndgameMessage.toLobby(this.playerGroup.getLobbyId, endMessage);
//             const record = {
//                 players,
//                 startDate: this.startTime,
//                 duration: this.gameTimer.getTime,
//                 gameMode: this.gameMode,
//             };
//             this.mongodbService
//                 .addPlayerRecord(record)
//                 .then(() => OutputFilterGateway.sendRecord.toServer(record))
//                 .catch((e) => Logger.error(e));
//         } else {
//             GameAuthorityService.getPendingGames.removeGame(this.id);
//             const cancelMessage = {
//                 responseType: GameConnectionAttemptResponseType.Cancelled,
//                 gameId: this.id,
//             } as GameConnectionRequestOutputMessageDto;
//             OutputFilterGateway.sendConnectionAttemptResponseMessage.toLobby(this.playerGroup.getLobbyId, cancelMessage);
//         }
//         this.playerGroup.empty();
//     }

//     async removePlayer(playerId: string): Promise<boolean> {
//         const removedPlayer = this.playerGroup.leave(playerId, this.isOngoing);
//         if (removedPlayer) {
//             if (this.isOngoing) OutputFilterGateway.sendDeserterMessage.toLobby(this.playerGroup.getLobbyId, removedPlayer.name);
//         }
//         if (!removedPlayer) return false;
//         if (!this.playerGroup.getPlayerNbr) this.endGame();
//         OutputFilterGateway.sendPlayerConnectionMessage.toLobby(this.playerGroup.getLobbyId, {
//             playerConnectionStatus: PlayerConnectionStatus.Left,
//             user: {
//                 name: removedPlayer.name,
//                 id: removedPlayer.client.id,
//             },
//             playerNbr: this.playerGroup.getPlayerNbr,
//         });
//         return true;
//     }

//     join(user: User): boolean {
//         if (!this.isOngoing && this.playerGroup.joinUser(user)) {
//             OutputFilterGateway.sendPlayerConnectionMessage.toClient(this.playerGroup.host.client, {
//                 playerConnectionStatus: PlayerConnectionStatus.Joined,
//                 user: {
//                     name: user.name,
//                     id: user.client.id,
//                 },
//                 playerNbr: this.playerGroup.getPlayerNbr,
//             });
//             this.startGame();
//             return true;
//         }
//         return false;
//     }
// }
