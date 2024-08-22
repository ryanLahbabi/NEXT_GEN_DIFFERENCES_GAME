import { Error } from '@app/class/error-management/error.constants';
import { ConnectionsService } from '@app/services/authentification/connections.service';
import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './auth.constants';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private connectionsService: ConnectionsService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const header = this.getHeaderFromContext(context);
            const token = this.extractTokenFromHeader(header);

            Error.Auth.UNDEFINED_TOKEN.generateErrorIf(!token).formatMessage();
            Error.Auth.INVALID_TOKEN.generateErrorIf(this.connectionsService.isBlackListedToken(token)).formatMessage();
            const payload = await this.jwtService.verifyAsync(token, {
                secret: jwtConstants.secret,
            });
            const username = payload.sub;
            Error.Auth.SOCKET_CONNECTION_REQUIRED.generateErrorIf(!this.connectionsService.isConnected(username)).formatMessage(username);
            Error.Auth.MULTIPLE_CONNECTIONS.generateErrorIf(!this.connectionsService.isConnectedWithToken(username, token)).formatMessage(username);
            this.updateFormat(context, payload.sub);
        } catch (e) {
            Logger.error(`Access Blocked : ${e.message}`);
            return false;
        }
        return true;
    }

    private getHeaderFromContext(context: ExecutionContext) {
        const h1 = context.switchToWs().getClient().handshake?.auth;
        const h2 = context.switchToWs().getClient().handshake?.headers;
        const h3 = context.switchToHttp().getRequest()?.auth;
        const h4 = context.switchToHttp().getRequest()?.headers;
        switch (context.getType()) {
            case 'ws':
                if (h1?.authorization) return h1;
                else if (h2?.authorization) return h2;
                break;
            case 'http':
                if (h3?.authorization) return h3;
                else if (h4?.authorization) return h4;
                break;
            default:
                throw new UnauthorizedException();
        }
    }

    private updateFormat(context: ExecutionContext, username: string) {
        switch (context.getType()) {
            case 'ws':
                context.getArgs()[1] = {
                    username,
                    body: context.getArgs()[1],
                };
                break;
            case 'http':
                context.switchToHttp().getRequest().body = {
                    username,
                    body: context.switchToHttp().getRequest().body,
                };
                break;
            default:
                throw new UnauthorizedException();
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private extractTokenFromHeader(header: any): string | undefined {
        const [type, token] = header.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
