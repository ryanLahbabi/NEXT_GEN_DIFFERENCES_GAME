/* eslint-disable @typescript-eslint/naming-convention */
import ErrorCodes from '@app/class/error-management/error-codes';
import ErrorTrigger from '@app/class/error-management/error-trigger';
import { Error } from '@app/class/error-management/error.constants';
import { User, UserDocument } from '@app/model/database-schema/user/user.schema';
import MongooseErrorCode from '@app/services/mongoose-error-codes.constants';
import * as DevUsers from '@app/services/user/dev-users.json';
import ErrorDTO from '@common/dto/error.dto';
import { FriendUserDataDTO } from '@common/dto/user/friend-user-data.dto';
import { Language } from '@common/enums/user/language.enum';
import { Theme } from '@common/enums/user/theme.enum';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export default class UserDBService {
    readonly friendUserDataQuery: string = 'username avatar biography friends generalGameStatistics -_id';
    readonly publicUserDataQuery: string = 'username avatar biography -_id';
    readonly privateUserDataQuery: string =
        'username email avatar biography friends generalGameStatistics blockedUsers pendingFriendRequests interfacePreference elo -_id';
    private accessedUsers: { user: User; timeout: NodeJS.Timeout }[] = [];

    constructor(@InjectModel(User.name) public userModel: Model<UserDocument>) {
        this.userModel.count().then((userNbr: number) => {
            if (userNbr === 0) {
                for (const devUser of DevUsers) {
                    this.addUser(devUser.username, devUser.password, devUser.email, '')
                        .then((u) => Logger.debug(`User ${u.username} was added as a DevUser.`))
                        .catch((e) => Logger.error(e));
                }
            }
        });
    }

    async addUser(username: string, doubleHashedPassword: string, email: string, avatar: string): Promise<User> {
        try {
            const user = await this.userModel.create({ username, doubleHashedPassword, email, avatar });
            this.modifyUsersByName(username);
            return user;
        } catch (e) {
            const message = `Failed to create the user '${username}' : ${e.message}`;
            const duplicateEmail = new ErrorTrigger(
                MongooseErrorCode.DUPLICATE,
                Error.Auth.EMAIL_IN_USE,
                e.message.includes(`{ email: "${email}" }`),
            );
            const duplicateUsername = new ErrorTrigger(
                MongooseErrorCode.DUPLICATE,
                Error.Auth.USERNAME_IN_USE,
                e.message.includes(`{ username: "${username}" }`),
            );
            return Promise.reject(this.getTranslatedError(e.code, message, duplicateEmail, duplicateUsername));
        }
    }

    async removeUser(username: string): Promise<User> {
        try {
            this.modifyUsersByName(username);
            return await this.userModel.findOneAndDelete({ username });
        } catch (e) {
            const message = `Failed to remove the user '${username}' : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async getUserByName(username: string): Promise<User> {
        try {
            // let user = undefined; //this.accessedUsers.find((u) => u.user.username === username)?.user;
            // if (!user) {
            const user = await this.userModel.findOne({ username });
            Error.User.USER_NOT_FOUND.generateErrorIf(!user).formatMessage(username);
            // this.accessedUsers.push({ user, timeout: undefined });
            // }
            return user;
        } catch (e) {
            const message = `Failed to get a user with the username '${username}' : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async getUsersByName(usernames: string[]): Promise<User[]> {
        try {
            await this.userModel.find({ username: { $in: usernames } });
        } catch (e) {
            const message = `Failed to get the the data of one or many of these users '${usernames}' : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async updateBiography(username: string, biography: string): Promise<User | ErrorDTO> {
        try {
            this.modifyUsersByName(username);
            return this.userModel.findOneAndUpdate({ username }, { biography }, { new: true });
        } catch (e) {
            const message = `Failed to update biography of user '${username}' : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async updateUsername(presentUsername: string, newUsername: string): Promise<void> {
        try {
            await this.userModel.updateOne({ username: presentUsername }, { username: newUsername });
            const foundUser = this.accessedUsers.find((u) => u.user.username === presentUsername);
            if (foundUser) foundUser.user.username = newUsername;
        } catch (e) {
            const message = `Failed to update username of user '${presentUsername}' : ${e.message}`;
            const duplicateUsername = new ErrorTrigger(
                MongooseErrorCode.DUPLICATE,
                Error.Auth.USERNAME_IN_USE,
                e.message.includes(`{ username: "${newUsername}" }`),
            );
            return Promise.reject(this.getTranslatedError(e.code, message, duplicateUsername));
        }
    }

    async blockUser(username: string, blockedUsername: string) {
        try {
            this.modifyUsersByName(username, blockedUsername);
            let user1: User;
            let user2: User;
            Error.User.USER_NOT_FOUND.generateErrorIf((user1 = await this.userModel.findOne({ username })) === null).formatMessage(username);
            Error.User.CANNOT_BLOCK_ONESELF.generateErrorIf(username === blockedUsername).formatMessage(username);
            Error.User.USER_NOT_FOUND.generateErrorIf((user2 = await this.userModel.findOne({ username: blockedUsername })) === null).formatMessage(
                blockedUsername,
            );
            Error.User.USER_ALREADY_BLOCKED.generateErrorIf(user1.hasBlocked.includes(user2.username)).formatMessage(blockedUsername);

            const p1 = this.removeFriend(username, blockedUsername);
            const p2 = this.userModel.updateOne({ username }, { $push: { blockRelations: blockedUsername } }).exec();
            const p3 = this.userModel.updateOne({ username: blockedUsername }, { $push: { blockRelations: username } }).exec();
            const p4 = this.userModel.updateOne({ username }, { $push: { hasBlocked: blockedUsername } }).exec();

            const p5 = this.userModel.updateOne({ username }, { $pull: { 'pendingFriendRequests.sent': blockedUsername } });
            const p6 = this.userModel.updateOne({ username }, { $pull: { 'pendingFriendRequests.received': blockedUsername } });
            const p7 = this.userModel.updateOne({ username: blockedUsername }, { $pull: { 'pendingFriendRequests.sent': username } });
            const p8 = this.userModel.updateOne({ username: blockedUsername }, { $pull: { 'pendingFriendRequests.received': username } });

            await Promise.all([p1, p2, p3, p4, p5, p6, p7, p8]);
        } catch (e) {
            const message = `Failed to block '${blockedUsername}' for '${username}' : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async unblockUser(username: string, blockedUsername: string) {
        try {
            this.modifyUsersByName(username, blockedUsername);
            let user1: User;
            let user2: User;
            Error.User.USER_NOT_FOUND.generateErrorIf((user1 = await this.userModel.findOne({ username })) === null).formatMessage(username);
            Error.User.CANNOT_UNBLOCK_ONESELF.generateErrorIf(username === blockedUsername).formatMessage(username);
            Error.User.USER_NOT_FOUND.generateErrorIf((user2 = await this.userModel.findOne({ username: blockedUsername })) === null).formatMessage(
                blockedUsername,
            );
            Error.User.USER_NOT_BLOCKED.generateErrorIf(!user1.hasBlocked.includes(user2.username)).formatMessage(blockedUsername);

            const promise1 = this.userModel.updateOne({ username }, { $pull: { blockRelations: blockedUsername } }).exec();
            const promise2 = this.userModel.updateOne({ username: blockedUsername }, { $pull: { blockRelations: username } }).exec();
            const promise3 = this.userModel.updateOne({ username }, { $pull: { hasBlocked: blockedUsername } }).exec();
            await Promise.all([promise1, promise2, promise3]);
        } catch (e) {
            const message = `Failed to unblock '${blockedUsername}' for '${username}' : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async showPendingFriendRequest(username: string) {
        try {
            const user = await this.userModel.findOne({ username });
            Error.User.USER_NOT_FOUND.generateErrorIf(!user).formatMessage(username);
            return user.pendingFriendRequests.received;
        } catch (e) {
            const message = `Failed to show pending friend requests for user '${username}' : ${e.message}`;
            return Promise.reject(message);
        }
    }

    async createFriendRequest(username: string, potentialFriend: string) {
        try {
            this.modifyUsersByName(username, potentialFriend);
            Error.User.CANNOT_BEFRIEND_ONESELF.generateErrorIf(username === potentialFriend).formatMessage(username);
            const user1: User = await this.userModel.findOne({ username });
            let user2: User;
            Error.User.USER_NOT_FOUND.generateErrorIf((user2 = await this.userModel.findOne({ username: potentialFriend })) === null).formatMessage(
                potentialFriend,
            );
            Error.User.CANNOT_SEND_FRIEND_REQUEST_IF_BLOCKED.generateErrorIf(
                user1.blockRelations.includes(user2.username) || user2.blockRelations.includes(user1.username),
            ).formatMessage(username, potentialFriend);

            const promise1 = this.userModel.updateOne({ username }, { $addToSet: { 'pendingFriendRequests.sent': potentialFriend } }).exec();
            const promise2 = this.userModel
                .updateOne(
                    {
                        // eslint-disable-next-line quote-props
                        username: potentialFriend,
                        'pendingFriendRequests.received.from': { $ne: username },
                    },
                    { $addToSet: { 'pendingFriendRequests.received': { from: username, seen: false } } },
                )
                .exec();
            await Promise.all([promise1, promise2]);
        } catch (e) {
            const message = `Failed to create a friend request towards user '${potentialFriend}' from '${username}' : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async acceptFriendRequest(username: string, friendUsername: string) {
        try {
            this.modifyUsersByName(username, friendUsername);
            let user2: User;
            Error.User.RESPONDING_TO_HIMSELF.generateErrorIf(username === friendUsername).formatMessage(username);
            Error.User.USER_NOT_FOUND.generateErrorIf((await this.userModel.findOne({ username })) === null).formatMessage(username);
            Error.User.USER_NOT_FOUND.generateErrorIf((user2 = await this.userModel.findOne({ username: friendUsername })) === null).formatMessage(
                friendUsername,
            );
            Error.User.FRIEND_REQUEST_NOT_FOUND.generateErrorIf(!user2.pendingFriendRequests.sent.includes(username)).formatMessage(
                username,
                friendUsername,
            );

            const promise1 = this.userModel
                .updateOne(
                    { username },
                    {
                        $addToSet: { friends: friendUsername },
                        pendingFriendRequests: { $pull: { received: { from: friendUsername } } },
                    },
                )
                .exec();

            const promise2 = this.userModel
                .updateOne(
                    { username: friendUsername },
                    {
                        $addToSet: { friends: username },
                        pendingFriendRequests: { $pull: { sent: username } },
                    },
                )
                .exec();
            await Promise.all([promise1, promise2]);
        } catch (e) {
            const message = `User '${username}' failed to accept the friend request of '${friendUsername}'. : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async rejectFriendRequest(username: string, friendUsername: string) {
        try {
            this.modifyUsersByName(username, friendUsername);
            let user2: User;
            Error.User.RESPONDING_TO_HIMSELF.generateErrorIf(username === friendUsername).formatMessage(username);
            Error.User.USER_NOT_FOUND.generateErrorIf((await this.userModel.findOne({ username })) === null).formatMessage(username);
            Error.User.USER_NOT_FOUND.generateErrorIf((user2 = await this.userModel.findOne({ username: friendUsername })) === null).formatMessage(
                friendUsername,
            );
            Error.User.FRIEND_REQUEST_NOT_FOUND.generateErrorIf(!user2.pendingFriendRequests.sent.includes(username)).formatMessage(
                username,
                friendUsername,
            );

            const promise1 = this.userModel
                .updateOne({ username }, { pendingFriendRequests: { $pull: { received: { from: friendUsername } } } })
                .exec();
            const promise2 = this.userModel.updateOne({ friendUsername }, { pendingFriendRequests: { $pull: { sent: username } } }).exec();
            await Promise.all([promise1, promise2]);
        } catch (e) {
            const message = `User '${username}' failed to reject the friend request of '${friendUsername}'. : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async removeFriend(username: string, friendUsername: string) {
        try {
            this.modifyUsersByName(username, friendUsername);
            const user1 = await this.userModel.findOne({ username });
            const user2 = await this.userModel.findOne({ username: friendUsername });

            Error.User.USER_NOT_FOUND.generateErrorIf(user1 === null).formatMessage(username);
            Error.User.USER_NOT_FOUND.generateErrorIf(user2 === null).formatMessage(friendUsername);

            const promise1 = this.userModel.updateOne({ username }, { $pull: { friends: friendUsername } }).exec();
            const promise2 = this.userModel.updateOne({ username: friendUsername }, { $pull: { friends: username } }).exec();

            await Promise.all([promise1, promise2]);
        } catch (e) {
            const message = `Failed to remove '${friendUsername}' from '${username}'s friend list: ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async getAllUsers(except?: string[]): Promise<FriendUserDataDTO[]> {
        try {
            return await this.userModel.find({ username: { $nin: except || [] } }).select(this.privateUserDataQuery);
        } catch (e) {
            const message = `Failed to get all the users : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async updateLanguage(username: string, language: Language) {
        try {
            this.modifyUsersByName(username);
            await this.userModel.updateOne({ username }, { $set: { 'interfacePreference.language': language } });
        } catch (e) {
            const message = `Failed to update language : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async updateAvatar(username: string, avatar: string) {
        try {
            this.modifyUsersByName(username);
            await this.userModel.updateOne({ username }, { avatar });
        } catch (e) {
            const message = `Failed to update avatar : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async updatePassword(email: string, doubleHashedPassword: string) {
        try {
            this.modifyUsersByEmail(email);
            await this.userModel.updateOne({ email }, { doubleHashedPassword });
        } catch (e) {
            const message = `Failed to update password : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async updateTheme(username: string, theme: Theme) {
        try {
            this.modifyUsersByName(username);
            await this.userModel.updateOne({ username }, { $set: { 'interfacePreference.theme': theme } });
        } catch (e) {
            const message = `Failed to update theme : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }
    async updateSuccess(username: string, success: string) {
        try {
            this.modifyUsersByName(username);
            await this.userModel.updateOne({ username }, { success });
        } catch (e) {
            const message = `Failed to update avatar : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }
    async updateFailure(username: string, failure: string) {
        try {
            this.modifyUsersByName(username);
            await this.userModel.updateOne({ username }, { failure });
        } catch (e) {
            const message = `Failed to update avatar : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    modifyUsersByName(...usernames: string[]) {
        this.accessedUsers = this.accessedUsers.filter((u) => {
            const isIncluded = usernames.includes(u.user.username);
            return !isIncluded;
        });
    }

    modifyUsersByEmail(...emails: string[]) {
        this.accessedUsers = this.accessedUsers.filter((u) => {
            const isIncluded = emails.includes(u.user.email);
            return !isIncluded;
        });
    }

    private getTranslatedError(triggerCode: number | string, message: string, ...args: ErrorTrigger[]): ErrorDTO {
        for (const trigger of args) if (triggerCode === trigger.triggerCode && trigger.condition) return trigger.binding.dto(message);
        if (typeof triggerCode === 'string') return ErrorCodes.get(triggerCode)?.dto(message);
        return Error.Misc.UNKNOWN.dto(message);
    }
}
