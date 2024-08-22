import { AuthGuard } from '@app/guards/auth.guard';
import { AuthService } from '@app/services/authentification/auth.service';
import { ConnectionsService } from '@app/services/authentification/connections.service';
import UserDBService from '@app/services/user/user.db.service';
import { Body, Controller, HttpCode, HttpStatus, Post, Put, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private connectionsService: ConnectionsService, private userDBService: UserDBService) {}

    // eslint-disable-next-line max-params
    @HttpCode(HttpStatus.CREATED)
    @Post('signup')
    async signUp(
        @Body('username') username: string,
        @Body('hashedPassword') hashedPassword: string,
        @Body('email') email: string,
        @Body('avatar') avatar: string,
        @Res() response: Response,
    ) {
        return this.authService
            .signUp(username, hashedPassword, email, avatar)
            .then((res) => response.status(HttpStatus.CREATED).send(res))
            .catch((err) => response.status(HttpStatus.BAD_REQUEST).send(err));
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async signIn(@Body('username') username: string, @Body('hashedPassword') hashedPassword: string, @Res() response: Response) {
        try {
            const res = await this.authService.signIn(username, hashedPassword);
            return response.status(HttpStatus.OK).send(res);
        } catch (err) {
            return response.status(HttpStatus.BAD_REQUEST).send(err);
        }
    }

    @UseGuards(AuthGuard)
    @Post('adminLogin')
    async adminLogin(@Body('username') username: string, @Body('body') body: { password: string }, @Res() response: Response) {
        try {
            if (body.password === 'Badr') {
                this.connectionsService.setAdmin(username);
                return response.status(HttpStatus.OK).send();
            }
        } catch (err) {
            return response.status(HttpStatus.BAD_REQUEST).send(err);
        }
        return response.status(HttpStatus.FORBIDDEN).send();
    }

    @HttpCode(HttpStatus.OK)
    @Post('send-verification-email')
    async sendVerificationEmail(@Body('email') email: string, @Body('verificationCode') verificationCode: string, @Res() response: Response) {
        try {
            // Send verification email using the provided email and verification code
            await this.authService.sendVerificationEmail(email, verificationCode);
            return response.status(HttpStatus.OK).send('Verification email sent successfully');
        } catch (error) {
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error sending verification email');
        }
    }
    @Post('send-confirmation-email')
    async sendConfirmationEmail(@Body('email') email: string, @Res() response: Response) {
        try {
            await this.authService.sendConfirmationEmail(email);
            return response.status(HttpStatus.OK).send('Confirmation email sent successfully');
        } catch (error) {
            return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Failed to send confirmation email');
        }
    }
    @Put('update-password')
    async updatePassword(@Body('email') email: string, @Body('password') password: string, @Res() response: Response) {
        try {
            await this.userDBService.updatePassword(email, password);
            response.status(HttpStatus.OK).send({ message: 'Password updated successfully' });
        } catch (error) {
            response.status(HttpStatus.BAD_REQUEST).send({ error: error.message });
        }
    }
}
