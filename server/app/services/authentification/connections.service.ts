import { Error } from '@app/class/error-management/error.constants';
// eslint-disable-next-line import/no-named-as-default
import Roles from '@common/enums/user/roles.enum';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface ConnectedUserData {
    token: string;
    socket: Socket;
    role: Roles;
    blockedUsers: string[];
    avatar: string;
}

@Injectable({ durable: true })
export class ConnectionsService {
    private connectedUsers: { [username: string]: ConnectedUserData } = {};
    private tokenBlacklist: string[] = [];

    getConnectedNames(): string[] {
        return Object.keys(this.connectedUsers);
    }

    getUserData(username: string): ConnectedUserData {
        if (this.isConnected(username)) return this.connectedUsers[username];
        return null;
    }

    isAdmin(username: string) {
        if (username === undefined) return false;
        return this.connectedUsers[username].role === Roles.Admin;
    }

    setAdmin(username: string) {
        const isBadUser = username === undefined || !this.isConnected(username);
        Error.User.USER_NOT_FOUND.generateErrorIf(isBadUser).formatMessage(username);
        this.connectedUsers[username].role = Roles.Admin;
    }

    isConnected(username: string) {
        if (username === undefined) return false;
        return this.connectedUsers[username] !== undefined;
    }

    isBlackListedToken(token: string) {
        return this.tokenBlacklist.includes(token);
    }

    isConnectedWithToken(username: string, token: string) {
        if (!username || !token) return false;
        return this.connectedUsers[username]?.token === token;
    }

    // eslint-disable-next-line max-params
    connect(username: string, token: string, socket: Socket, blockedUsers: string[], avatar?: string): boolean {
        const canConnect = !this.tokenBlacklist.includes(token) && !this.isConnected(username);
        if (canConnect) this.connectedUsers[username] = { token, socket, role: Roles.User, blockedUsers, avatar };
        return canConnect;
    }

    getAvatar(username: string): string {
        const user = this.getUserData(username);
        if (user) return user.avatar;
    }

    blackListUserToken(username: string) {
        const user = this.getUserData(username);
        if (user) this.tokenBlacklist.push(user.token);
    }

    disconnect(username: string) {
        if (username) delete this.connectedUsers[username];
    }

    updateUsername(presentUsername: string, newUsername: string, token: string) {
        const user = this.getUserData(presentUsername);
        if (user) this.tokenBlacklist.push(user.token);
        user.token = token;
        user.socket.data['username'] = newUsername;
        this.connectedUsers[newUsername] = user;
        delete this.connectedUsers[presentUsername];
    }

    updateAvatar(username: string, avatar: string) {
        const user = this.getUserData(username);
        if (user) user.avatar = avatar;
    }
}
