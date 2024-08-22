// import DifferenceManager from '@app/class/game-logic/difference-manager/difference-manager';
// import LimitedTime from '@app/class/game-logic/game-interfaces/limited-time-interface';
// import SinglePlayerGroup from '@app/class/player-groups/solo-player-group/solo-player-group';
// import Timer from '@app/class/watch/timer/timer';
// import { GameConnectionData } from '@app/gateways/game.gateway.constants';
// import OutputFilterGateway from '@app/gateways/output-filters.gateway';
// import GameAuthorityService from '@app/services/game-authority/game-authority.service';
// import MongoDBService from '@app/services/mongodb/mongodb.service';
// import { GameConnectionAttemptResponseType } from '@common/enums/game-play/game-connection-attempt-response-type';
// import { GameMode } from '@common/enums/game-play/game-mode';
// import { GameConnectionRequestOutputMessageDto } from '@common/interfaces/game-play/game-connection-request.dto';
// import { EndgameOutputDto } from '@common/interfaces/game-play/game-endgame.dto';
// import { Logger } from '@nestjs/common';

// export default class LimitedTimeSolo extends LimitedTime {
//     constructor(mongodbService: MongoDBService) {
//         super(mongodbService);
//         this.gameMode = GameMode.LimitedTimeSolo;
//         this.gameValues = JSON.parse(JSON.stringify(GameAuthorityService.gameValues));
//     }

//     async initialize(data: GameConnectionData): Promise<boolean> {
//         if (await this.fetchInitialCards()) {
//             this.id = data.user.client.id;
//             this.cardId = data.cardId;
//             this.playerGroup = new SinglePlayerGroup(data.user);
//             this.shiftCards();
//             this.differenceManager = new DifferenceManager(this.card, this.cardFiles);
//             this.playerGroup.host.differenceManager = this.differenceManager;
//             const successMessage: GameConnectionRequestOutputMessageDto = {
//                 responseType: GameConnectionAttemptResponseType.Starting,
//                 gameName: this.card.name,
//                 startingIn: 0,
//                 modifiedImage: this.cardFiles.modifiedImage,
//                 originalImage: this.cardFiles.originalImage,
//                 gameId: this.id,
//                 difficulty: this.card.difficulty,
//                 time: this.gameValues.timerTime,
//                 differenceNbr: this.card.differenceNbr,
//                 playerNbr: 1,
//                 gameValues: this.gameValues,
//                 hostName: this.playerGroup.host.name,
//             };

//             OutputFilterGateway.sendConnectionAttemptResponseMessage.toClient(data.user.client, successMessage);
//             GameAuthorityService.getOngoingGames.addGame(this);
//             const upcomingCard = this.upcomingCards[0];
//             if (upcomingCard)
//                 OutputFilterGateway.sendNextCard.toLobby(this.playerGroup.getLobbyId, {
//                     name: upcomingCard.data.name,
//                     originalImage: upcomingCard.files.originalImage,
//                     modifiedImage: upcomingCard.files.modifiedImage,
//                     nbDifferences: upcomingCard.data.differenceNbr,
//                 });
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
//         this.gameWatch = new Timer();
//         this.gameWatch.eachInterval = () => OutputFilterGateway.sendTime.toLobby(this.playerGroup.getLobbyId, this.gameWatch.getSeconds);
//         this.gameWatch.onEnd = async () => this.endGame();
//         this.gameTimer.start();
//         this.gameWatch.set(this.gameValues.timerTime + 1);
//         this.gameWatch.start();
//         this.isOngoing = true;
//     }

//     async endGame() {
//         GameAuthorityService.getOngoingGames.removeGame(this.id);
//         if (this.isOngoing) {
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
//         }
//         this.playerGroup.empty();
//     }

//     async removePlayer(playerId: string): Promise<boolean> {
//         const removedPlayer = this.playerGroup.leave(playerId, this.isOngoing) !== undefined;
//         if (removedPlayer) this.endGame();
//         return removedPlayer;
//     }
// }
