import { Error } from '@app/class/error-management/error.constants';
import { AuthGuard } from '@app/guards/auth.guard';
import { AuthService } from '@app/services/authentification/auth.service';
import { ConnectionsService } from '@app/services/authentification/connections.service';
import ChannelManagerService from '@app/services/chat/channel-manager.service';
import { ReplayService } from '@app/services/replay/replay.service';
import UserDBService from '@app/services/user/user.db.service';
import { PrivateUserDataDTO } from '@common/dto/user/private-user-data.dto';
import { Language } from '@common/enums/user/language.enum';
import { Theme } from '@common/enums/user/theme.enum';
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Put, Res, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ControllerConstants } from './controller.constants';

@Controller('user')
@UseGuards(AuthGuard)
export default class UserController {
    // eslint-disable-next-line max-params
    constructor(
        private userDBService: UserDBService,
        private connections: ConnectionsService,
        private authService: AuthService,
        private videoDBService: ReplayService,
        private channelManagerService: ChannelManagerService,
    ) {}

    @HttpCode(HttpStatus.OK)
    @Get('me')
    async getUserDetails(@Body('username') username: string, @Res() response: Response) {
        return await this.userDBService
            .getUserByName(username)
            .then((res) => {
                const privateUserData: PrivateUserDataDTO = {
                    username: res.username,
                    email: res.email,
                    avatar: res.avatar,
                    biography: res.biography,
                    friends: res.friends,
                    generalGameStatistics: res.generalGameStatistics,
                    hasBlocked: res.hasBlocked,
                    blockRelations: res.blockRelations,
                    pendingFriendRequests: res.pendingFriendRequests,
                    interfacePreference: res.interfacePreference,
                    channels: res.channels.map((c) => c.toHexString()),
                    success: res.success,
                    failure: res.failure,
                    elo: res.elo,
                    likedCards: res.likedCards,
                    dislikedCards: res.dislikedCards,
                };
                response.status(HttpStatus.CREATED).send(privateUserData);
            })
            .catch((err) => response.status(HttpStatus.BAD_REQUEST).send(err));
    }

    @HttpCode(HttpStatus.OK)
    @Post('block')
    async blockUser(@Body('username') username: string, @Body('body') body: { username: string }, @Res() response: Response) {
        try {
            await this.userDBService.blockUser(username, body.username);
            this.connections.getUserData(username).blockedUsers.push(body.username);
            this.connections.getUserData(body.username)?.blockedUsers.push(username);
            response.status(HttpStatus.OK).send();
        } catch (e) {
            response.status(HttpStatus.BAD_REQUEST).send(e);
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('unblock')
    async unblockUser(@Body('username') username: string, @Body('body') body: { username: string }, @Res() response: Response) {
        try {
            await this.userDBService.unblockUser(username, body.username);

            const userData1 = this.connections.getUserData(username);
            const userData2 = this.connections.getUserData(body.username);
            userData1.blockedUsers = userData1.blockedUsers.filter((u) => u !== body.username);
            if (userData2) userData2.blockedUsers = userData2.blockedUsers.filter((u) => u !== username);
            response.status(HttpStatus.OK).send();
        } catch (e) {
            Logger.error(e);
            response.status(HttpStatus.BAD_REQUEST).send(e);
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('unfriend')
    async unfriendUser(@Body('username') username: string, @Body('body') body: { username: string }, @Res() response: Response) {
        try {
            await this.userDBService.removeFriend(username, body.username);
            response.status(HttpStatus.OK).send();
        } catch (e) {
            Logger.error(e);
            response.status(HttpStatus.BAD_REQUEST).send(e);
        }
    }

    @HttpCode(HttpStatus.OK)
    @Put('biography')
    async updateBiography(@Body('username') username: string, @Body('body') body: { biography: string }, @Res() response: Response) {
        try {
            Error.User.BIOGRAPHY_TOO_LONG.generateErrorIf(body.biography.length > ControllerConstants.User.MAX_BIOGRAPHY_LENGTH).formatMessage(
                ControllerConstants.User.MAX_BIOGRAPHY_LENGTH.toString(),
                body.biography.length.toString(),
            );
            await this.userDBService.updateBiography(username, body.biography);
            response.status(HttpStatus.OK).send();
        } catch (e) {
            Logger.error(e);
            response.status(HttpStatus.BAD_REQUEST).send(e);
        }
    }

    @HttpCode(HttpStatus.OK)
    @Put('language')
    async updateLanguage(@Body('username') username: string, @Body('body') body: { language: Language }, @Res() response: Response) {
        try {
            await this.userDBService.updateLanguage(username, body.language);
            response.status(HttpStatus.OK).send();
        } catch (e) {
            Logger.error(e);
            response.status(HttpStatus.BAD_REQUEST).send(e);
        }
    }

    @HttpCode(HttpStatus.OK)
    @Put('theme')
    async updateTheme(@Body('username') username: string, @Body('body') body: { theme: Theme }, @Res() response: Response) {
        try {
            await this.userDBService.updateTheme(username, body.theme);
            response.status(HttpStatus.OK).send();
        } catch (e) {
            Logger.error(e);
            response.status(HttpStatus.BAD_REQUEST).send(e);
        }
    }

    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'base64/jpg/string avatar image with sides of 250px/' })
    @Put('avatar')
    async updateAvatar(@Body('username') username: string, @Body('body') body: { avatar: string }, @Res() response: Response) {
        try {
            await this.userDBService.updateAvatar(username, body.avatar);
            this.connections.updateAvatar(username, body.avatar);
            response.status(HttpStatus.OK).send();
        } catch (e) {
            Logger.error(e);
            response.status(HttpStatus.BAD_REQUEST).send(e);
        }
    }
    @HttpCode(HttpStatus.OK)
    @Put('success')
    async updateSuccess(@Body('username') username: string, @Body('body') body: { success: string }, @Res() response: Response) {
        try {
            await this.userDBService.updateSuccess(username, body.success);
            response.status(HttpStatus.OK).send();
        } catch (e) {
            Logger.error(e);
            response.status(HttpStatus.BAD_REQUEST).send(e);
        }
    }
    @HttpCode(HttpStatus.OK)
    @Put('failure')
    async updateFailure(@Body('username') username: string, @Body('body') body: { failure: string }, @Res() response: Response) {
        try {
            await this.userDBService.updateFailure(username, body.failure);
            response.status(HttpStatus.OK).send();
        } catch (e) {
            Logger.error(e);
            response.status(HttpStatus.BAD_REQUEST).send(e);
        }
    }

    @HttpCode(HttpStatus.OK)
    @Post('username')
    async updateUsername(@Body('username') presentUsername: string, @Body('body') body: { newUsername: string }, @Res() response: Response) {
        try {
            Error.Auth.USERNAME_IN_USE.generateErrorIf(presentUsername === body.newUsername).formatMessage();
            await this.userDBService.updateUsername(presentUsername, body.newUsername);
            await this.channelManagerService.updateUsername(presentUsername, body.newUsername);
            await this.videoDBService.updateUsername(presentUsername, body.newUsername);

            const newToken = await this.authService.getNewToken(body.newUsername);
            this.connections.updateUsername(presentUsername, body.newUsername, newToken);
            response.status(HttpStatus.OK).send({ token: newToken, username: body.newUsername });
        } catch (e) {
            Logger.error(e);
            response.status(HttpStatus.BAD_REQUEST).send(e);
        }
    }
}
