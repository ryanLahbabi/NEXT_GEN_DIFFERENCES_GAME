import { Error } from '@app/class/error-management/error.constants';
import { User } from '@app/model/database-schema/user/user.schema';
import UserDBService from '@app/services/user/user.db.service';
import { Inject, Injectable, UnauthorizedException, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { ConnectionsService } from './connections.service';

@Injectable({ durable: true })
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserDBService)) private userDBService: UserDBService,
        private jwtService: JwtService,
        private connectionsService: ConnectionsService,
    ) {}

    async getNewToken(username: string) {
        const payload = { sub: username };
        return await this.jwtService.signAsync(payload);
    }

    async signIn(username: string, hashedPassword: string): Promise<object> {
        try {
            Error.User.USER_ALREADY_CONNECTED.generateErrorIf(this.connectionsService.isConnected(username)).formatMessage(username);
            const user: User = await this.userDBService.getUserByName(username);
            const doubleHashedPassword = this.encrypt(hashedPassword);
            if (user?.doubleHashedPassword !== doubleHashedPassword) {
                throw new UnauthorizedException();
            }
            const accessToken = await this.getNewToken(user.username);
            return { accessToken };
        } catch (e) {
            e.message = `Failed to login : ${e.message}`;
            return Promise.reject(e);
        }
    }

    async signUp(username: string, hashedPassword: string, email: string, avatar: string): Promise<object> {
        try {
            const doubleHashedPassword = this.encrypt(hashedPassword);
            await this.userDBService.addUser(username, doubleHashedPassword, email, avatar);
            const payload = { sub: username };
            const accessToken = await this.jwtService.signAsync(payload);
            return { accessToken };
        } catch (e) {
            e.message = `Failed to create an account : ${e.message}`;
            throw e;
        }
    }

    encrypt(toEncrypt: string): string {
        return toEncrypt;
    }

    async sendVerificationEmail(email: string, verificationCode: string): Promise<boolean> {
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp-mail.outlook.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'Poly308@outlook.com',
                    pass: 'Badr208!',
                },
            });

            const mailOptions = {
                from: 'Poly308@outlook.com', // Set the from address to your Outlook email
                to: email,
                subject: 'Verification Code',
                html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
            };

            await transporter.sendMail(mailOptions);
            return true; // Email sent successfully
        } catch (error) {
            return false; // Failed to send email
        }
    }

    async sendConfirmationEmail(email: string): Promise<void> {
        const transporter = nodemailer.createTransport({
            host: 'smtp-mail.outlook.com',
            port: 587,
            secure: false,
            auth: {
                user: 'Poly308@outlook.com',
                pass: 'Badr208!',
            },
        });

        const mailOptions = {
            from: 'Poly308@outlook.com', // Set the from address to your Outlook email
            to: email,
            subject: 'Password Reset',
            html: '<p>Password reset Successful</strong></p>',
        };

        await transporter.sendMail(mailOptions);
    }
}
