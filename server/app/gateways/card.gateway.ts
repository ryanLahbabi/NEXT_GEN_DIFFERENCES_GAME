import DifferenceLocator from '@app/class/algorithms/difference-locator/difference-locator';
import { Error } from '@app/class/error-management/error.constants';
import Game from '@app/class/game-logic/game-interfaces/game-interface';
import { CardCreationFilter } from '@app/model/gateway-dto/creation/card-creation.dto';
import { CardValidationFilter } from '@app/model/gateway-dto/creation/card-validation.dto';
import GameAuthorityService from '@app/services/game-authority/game-authority.service';
import MongoDBService from '@app/services/mongodb/mongodb.service';
import { Difficulty } from '@common/enums/game-play/difficulty';
import { GameMode } from '@common/enums/game-play/game-mode';
import { Source } from '@common/enums/source';
import { Card } from '@common/interfaces/game-card/card';
import { CardPreview } from '@common/interfaces/game-card/card-preview';
import * as Events from '@common/socket-event-constants';
import { Logger } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import Jimp from 'jimp';
import { Server, Socket } from 'socket.io';
import { GATEWAY_PORT, getRandomBestTimes } from './game.gateway.constants';
import OutputFilterGateway from './output-filters.gateway';

@WebSocketGateway(GATEWAY_PORT)
export default class CardGateway {
    @WebSocketServer() server: Server;

    constructor(private mongoDBService: MongoDBService) {
        GameAuthorityService.mongoDBService = this.mongoDBService;
        this.mongoDBService.getAllCardIds().then((cards) => (GameAuthorityService.validCards = cards));
    }

    @SubscribeMessage(Events.ToServer.ALL_GAME_CARDS)
    async sendAllCards(client: Socket) {
        OutputFilterGateway.sendCardPreviews.toClient(client, await this.mongoDBService.getAllCardPreviews());
    }

    @SubscribeMessage(Events.ToServer.DELETE_ALL_CARDS)
    async deleteAllCards(client: Socket) {
        try {
            GameAuthorityService.validCards = [];
            await this.mongoDBService.removeAllCards();
            GameAuthorityService.getPendingGames.forEach((game: Game) => {
                game.endGame();
                return false;
            });
            OutputFilterGateway.sendDeleteAllCardsOutcome.toClient(client, true);
            OutputFilterGateway.sendCardPreviews.toServer(await this.mongoDBService.getAllCardPreviews());
        } catch (error) {
            OutputFilterGateway.sendDeleteAllCardsOutcome.toClient(client, false);
            Logger.error(error);
        }
    }

    @SubscribeMessage(Events.ToServer.DELETE_CARD)
    async deleteCard(client: Socket, id: string) {
        try {
            Error.Card.CARD_DOES_NOT_EXIST.generateErrorIf(!GameAuthorityService.validCards.includes(id)).formatMessage(id);
            GameAuthorityService.validCards = GameAuthorityService.validCards.filter((c) => c !== id);
            await this.mongoDBService.removeCardById(id);
            GameAuthorityService.getPendingGames.forEach((game: Game) => {
                if (game.getGameMode === GameMode.Classic1v1 && game.getCardId === id) game.endGame();
                return false;
            });
            OutputFilterGateway.sendDeleteAllCardsOutcome.toClient(client, true);
            OutputFilterGateway.sendCardPreviews.toServer(await this.mongoDBService.getAllCardPreviews());
        } catch (error) {
            OutputFilterGateway.sendDeleteAllCardsOutcome.toClient(client, false);
            Logger.error(error);
        }
    }

    /**
     * Verifies if a pair of images are eligible to generate a card
     *
     * @param client - The socket of the client who sent the event
     * @param input - two images and a radius, enough to run the difference-locator algorithm
     */
    @SubscribeMessage(Events.ToServer.CARD_VALIDATION_REQUEST)
    async validateCard(client: Socket, input: CardValidationFilter) {
        const cardCreator = new DifferenceLocator(input.originalImage, input.modifiedImage, Source.Base64);
        if (!(await cardCreator.findDifferences(input.range))) {
            OutputFilterGateway.sendCardValidationResponse.toClient(client, { valid: false, differenceNbr: cardCreator.getDifferenceNbr });
            return;
        }
        OutputFilterGateway.sendCardValidationResponse.toClient(client, await cardCreator.getValidationData());
    }

    /**
     * Sends a list of joinable games to the client
     *
     * @param client - The socket of the client who sent the event
     */
    @SubscribeMessage(Events.ToServer.CARD_CREATION_REQUEST)
    async createCard(client: Socket, input: CardCreationFilter) {
        const cardCreator = new DifferenceLocator(input.originalImage, input.modifiedImage, Source.Base64);
        if (!(await cardCreator.findDifferences(input.range)) || cardCreator.getDifficulty() === Difficulty.None) {
            OutputFilterGateway.sendCardCreationResponse.toClient(client, { valid: false });
            return;
        }
        const cardValues = cardCreator.getCreationData();
        const card: Card = {
            name: input.name,
            difficulty: cardValues.difficulty,
            classicSoloBestTimes: getRandomBestTimes(),
            classic1v1BestTimes: getRandomBestTimes(),
            differenceNbr: cardValues.differenceNbr,
            differences: cardValues.finalDifferences,
            likes: 0,
        };
        try {
            const newCardId = await this.mongoDBService.addCard(card, cardValues.imageData);
            GameAuthorityService.validCards.push(newCardId);
            OutputFilterGateway.sendCardCreationResponse.toClient(client, { valid: newCardId !== undefined });
            if (newCardId) {
                await cardValues.imageData.originalImage.getBase64Async(Jimp.MIME_BMP);
                const newCard: CardPreview = {
                    name: input.name,
                    classicSoloBestTimes: card.classicSoloBestTimes,
                    classic1v1BestTimes: card.classic1v1BestTimes,
                    difficulty: cardValues.difficulty,
                    originalImage: (await cardValues.imageData.originalImage.getBase64Async(Jimp.MIME_BMP)).replace('data:image/bmp;base64,', ''),
                    id: newCardId,
                    nbrDifferences: card.differenceNbr,
                    likes: 0,
                };
                OutputFilterGateway.sendCardPreview.toServer(newCard);
            }
        } catch (e) {
            OutputFilterGateway.sendCardCreationResponse.toClient(client, { valid: false });
            Logger.error(e);
        }
    }
}
