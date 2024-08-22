import { AuthGuard } from '@app/guards/auth.guard';
import MongoDBService from '@app/services/mongodb/mongodb.service';
import { LikeOperation } from '@common/enums/like-operation.enum';
import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

@Controller('card')
@UseGuards(AuthGuard)
export class CardController {
    restrictedUsers: string[] = [];

    constructor(private mongoDBService: MongoDBService) {}

    @HttpCode(HttpStatus.OK)
    @Post('like')
    async likeCardFunction(
        @Body('username') username: string,
        @Body('body') body: { cardId: string; likeOp: LikeOperation },
        @Res() response: Response,
    ) {
        let error = false;
        try {
            if (this.restrictedUsers.includes(username)) {
                error = true;
                throw new Error('Like timeout');
            }
            this.restrictedUsers.push(username);
            const cardLikes = await this.mongoDBService.likeFunction(username, body.cardId, body.likeOp);
            // OutputFilterGateway.sendLikes.toServer({ cardId: body.cardId, likes: cardData });
            response.status(HttpStatus.OK).send({ cardLikes });
        } catch (e) {
            response.status(HttpStatus.GATEWAY_TIMEOUT).send(e);
        }
        if (!error) this.restrictedUsers = this.restrictedUsers.filter((u) => u !== username);
    }
}
