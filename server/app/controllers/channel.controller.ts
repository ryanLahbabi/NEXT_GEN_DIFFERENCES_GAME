import { AuthGuard } from '@app/guards/auth.guard';
import ChannelManagerService from '@app/services/chat/channel-manager.service';
import ChannelDBService from '@app/services/chat/channel.db.service';
import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

@Controller('chan')
@UseGuards(AuthGuard)
export class ChannelController {
    constructor(private channelManager: ChannelManagerService, private channelDBService: ChannelDBService) {}

    @HttpCode(HttpStatus.CREATED)
    @Post('create')
    async createChannel(@Body('body') body: { name: string }, @Body('username') username: string, @Res() response: Response) {
        try {
            const channelId = await this.channelManager.createChannel(body.name, username);
            return response.status(HttpStatus.OK).send({ channelId });
        } catch (e) {
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e);
        }
    }

    @Delete()
    async deleteChannel(@Body('username') username: string, @Body('body') body: { channelId: string }, @Res() response: Response) {
        try {
            await this.channelManager.deleteChannel(body.channelId, username);
            return response.status(HttpStatus.OK).send();
        } catch (e) {
            return response.status(HttpStatus.BAD_REQUEST).send(e);
        }
    }

    @Post('join')
    async joinChannel(@Body('username') username: string, @Body('body') body: { channelId: string }, @Res() response: Response) {
        try {
            await this.channelManager.joinChannel(username, body.channelId);
            return response.status(HttpStatus.OK).send();
        } catch (e) {
            this.channelDBService.cleanupChannels();
            return response.status(HttpStatus.BAD_REQUEST).send(e);
        }
    }

    @Post('leave')
    async leaveChannel(@Body('username') username: string, @Body('body') body: { channelId: string }, @Res() response: Response) {
        try {
            await this.channelManager.leaveChannel(body.channelId, username);
            return response.status(HttpStatus.OK).send();
        } catch (e) {
            this.channelDBService.cleanupChannels();
            return response.status(HttpStatus.BAD_REQUEST).send(e);
        }
    }
}
