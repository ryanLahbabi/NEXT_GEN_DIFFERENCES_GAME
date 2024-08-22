import FileSystemManager from '@app/class/diverse/file-system-manager/file-system-manager';
import DifferenceManager from '@app/class/game-logic/difference-manager/difference-manager';
import Game from '@app/class/game-logic/game-interfaces/game-interface';
import Player from '@app/class/game-logic/player/player';
import { oneSecond } from '@app/class/watch/watch/watch.constants';
import OutputFilterGateway from '@app/gateways/output-filters.gateway';
import { ERROR_TOLERANCE, STORED_CARDS } from '@app/model/gateway-dto/game/game.constants';
import { Card } from '@common/interfaces/game-card/card';
import { CardBase64Files } from '@common/interfaces/game-card/card-base64-files';
import { GameplayCard } from '@common/interfaces/game-card/gameplay-card';
import { GameClickOutputDto, GameDifferenceImages } from '@common/interfaces/game-play/game-click.dto';
import { Coordinates } from '@common/interfaces/general/coordinates';
import { Logger } from '@nestjs/common';

export default abstract class LimitedTime extends Game {
    upcomingCards: GameplayCard[] = [];
    cardIds: string[];
    differenceManager: DifferenceManager;
    readonly savedCardsNbr = STORED_CARDS;

    async fetchInitialCards(): Promise<boolean> {
        const NECESSARY_STARTING_CARDS = 2;
        try {
            this.cardIds = await this.mongodbService.getAllCardIds();
            while (this.upcomingCards.length < NECESSARY_STARTING_CARDS && this.cardIds.length !== 0) {
                const card = await this.getRandomCard();
                if (card) this.upcomingCards.push(card);
            }
            for (let i = 0; i < this.savedCardsNbr - NECESSARY_STARTING_CARDS; i++) {
                this.getRandomCard().then((c) => {
                    if (c) this.upcomingCards.push(c);
                });
            }
        } catch (e) {
            Logger.error(e);
            return false;
        }
        return this.upcomingCards.length !== 0;
    }

    verifyClick(playerId: string, clickCoordinates: Coordinates): boolean {
        return super.verifyClick(playerId, clickCoordinates, (foundDifferenceValues: GameDifferenceImages, player: Player) => {
            if (foundDifferenceValues) {
                const json = {
                    valid: true,
                    playerName: player.name,
                };
                OutputFilterGateway.sendOtherClick.broadcast(player.client, json, this.playerGroup.getLobbyId);
                if (this.observerGroup.getLobbyId) OutputFilterGateway.sendOtherClick.broadcast(player.client, json, this.observerGroup.getLobbyId);
                OutputFilterGateway.sendClickResponseMessage.toClient(player.client, {
                    valid: true,
                });
                player.differencesFound++;
                this.shiftCards();
                this.gameWatch.add(this.gameValues.gainedTime, this.gameValues.timerTime);
                this.differenceManager = new DifferenceManager(this.card, this.cardFiles, this.differenceManager.getUsedHintNbr);
                this.playerGroup.forEachPlayer((p) => {
                    p.differenceManager = this.differenceManager;
                    return false;
                });
                return true;
            }
            OutputFilterGateway.sendOtherClick.broadcast(
                player.client,
                {
                    playerName: player.name,
                    valid: false,
                },
                this.playerGroup.getLobbyId,
            );
            const invalidClickResponse: GameClickOutputDto = {
                valid: false,
                penaltyTime: oneSecond,
            };
            OutputFilterGateway.sendClickResponseMessage.toClient(player.client, invalidClickResponse);
            player.startPenalty(oneSecond);
            return false;
        });
    }

    protected async getRandomCard(): Promise<GameplayCard> {
        let cardData: Card;
        let cardFiles: CardBase64Files;
        let errorCount = 0;
        while (errorCount < ERROR_TOLERANCE) {
            try {
                if (!this.cardIds.length) return undefined;
                const index = Math.floor(Math.random() * (this.cardIds.length - 1));
                const id = this.cardIds.splice(index, 1)[0];
                cardData = await this.mongodbService.getCardById(id);
                if (cardData) cardFiles = FileSystemManager.getImages(cardData);
                if (cardFiles) return { data: cardData, files: cardFiles };
            } catch (e) {
                errorCount++;
            }
            cardData = undefined;
            cardFiles = undefined;
        }
        return Promise.reject('Failed to fetch a card');
    }

    protected shiftCards() {
        let card;
        while (card === undefined) {
            if (this.upcomingCards.length) card = this.upcomingCards.shift();
            else {
                this.endGame();
                return;
            }
        }
        this.card = card.data;
        this.cardFiles = card.files;
        const upcomingCard = this.upcomingCards[0];
        if (upcomingCard) {
            const nextCards = {
                name: upcomingCard.data.name,
                originalImage: upcomingCard.files.originalImage,
                modifiedImage: upcomingCard.files.modifiedImage,
                nbDifferences: upcomingCard.data.differenceNbr,
            };
            OutputFilterGateway.sendNextCard.toLobby(this.playerGroup.getLobbyId, nextCards);
            if (this.observerGroup.getLobbyId) OutputFilterGateway.sendNextCard.toLobby(this.observerGroup.getLobbyId, nextCards);
        }
        this.getRandomCard()
            .then((c) => {
                if (c) this.upcomingCards.push(c);
            })
            .catch((e) => {
                this.endGame();
                this.mongodbService.start();
                Logger.error(e);
            });
    }
}
