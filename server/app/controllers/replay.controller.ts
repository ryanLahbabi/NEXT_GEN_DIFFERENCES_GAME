import { AuthGuard } from '@app/guards/auth.guard';
import { ReplayService } from '@app/services/replay/replay.service';
import { Replay } from '@common/interfaces/game-play/replay-action';
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Post, UseGuards } from '@nestjs/common';

@Controller('replays')
@UseGuards(AuthGuard)
export class ReplayController {
    constructor(private replayService: ReplayService) {}

    @HttpCode(HttpStatus.OK)
    @Post()
    async postReplay(@Body('body') body: { replay: Replay }) {
        try {
            return await this.replayService.postReplay(body.replay);
        } catch (e) {
            Logger.error(e);
        }
    }

    @HttpCode(HttpStatus.OK)
    @Get('info')
    async getReplayInfoByUser(@Body('username') createdBy: string) {
        try {
            return await this.replayService.getReplayInfoByUser(createdBy);
        } catch (e) {
            Logger.error(e);
        }
    }

    @HttpCode(HttpStatus.OK)
    @Get('dates')
    async getReplayDatesByUser(@Body('username') createdBy: string) {
        try {
            return await this.replayService.getReplayDatesByUser(createdBy);
        } catch (e) {
            Logger.error(e);
        }
    }

    @HttpCode(HttpStatus.OK)
    @Get(':createdAt')
    async getReplayByDatesAndUser(@Body('username') createdBy: string, @Param('createdAt') createdAt: string) {
        try {
            const info = await this.replayService.getReplayByDatesAndUser(createdBy, createdAt);
            return info;
        } catch (e) {
            Logger.error(e);
        }
    }

    // delete replay
    @HttpCode(HttpStatus.OK)
    @Post('delete/:createdAt')
    async deleteReplay(@Body('username') createdBy: string, @Param('createdAt') createdAt: string) {
        try {
            return this.replayService.deleteReplay(createdBy, createdAt);
        } catch (e) {
            Logger.error(e);
        }
    }
}
