import ErrorCodes from '@app/class/error-management/error-codes';
import ErrorTrigger from '@app/class/error-management/error-trigger';
import { Error } from '@app/class/error-management/error.constants';
import { Channel, ChannelDocument } from '@app/model/database-schema/channel/channel.schema';
import { User, UserDocument } from '@app/model/database-schema/user/user.schema';
import ErrorDTO from '@common/dto/error.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable({ durable: true })
export default class ChannelDBService {
    startPromise: Promise<void>;
    resolvePromise: (value: void | PromiseLike<void>) => void;

    constructor(
        @InjectModel(Channel.name) public channelModel: Model<ChannelDocument>,
        @InjectModel(User.name) public userModel: Model<UserDocument>,
    ) {
        this.startPromise = new Promise((resolves) => {
            this.resolvePromise = resolves;
        });
        this.cleanupChannels();
    }

    async cleanupChannels() {
        try {
            const allUsers = await this.userModel.find({}, { username: 1, channels: 1 });
            const allChannels = await this.channelModel.find({}, { _id: 1, members: 1 });
            const allUsernames = allUsers.map((u) => u.username);

            const removedMemberCount = (await this.channelModel.updateMany({ $pull: { members: { $nin: allUsernames } } })).modifiedCount;
            const removedEmptyChannelCount = (await this.channelModel.deleteMany({ members: { $size: 0 } })).deletedCount;

            const promises = [];
            allUsers.forEach((u) => {
                for (const channel of allChannels) {
                    const channelId = channel['_id'].toHexString();
                    const inChannel = channel.members.includes(u.username);
                    const inUser = u.channels.includes(channelId);
                    if (!inChannel && inUser)
                        promises.push(this.userModel.updateOne({ username: u.username }, { $pull: { channels: channelId } }).exec());
                    else if (inChannel && !inUser)
                        promises.push(this.channelModel.updateOne({ _id: channelId }, { $pull: { members: u.username } }).exec());
                }
            });
            await Promise.all(promises);
            Logger.debug(
                `${removedEmptyChannelCount} non-existant users removed from channels and ${removedMemberCount} channels where deleted since they had no members.`,
            );
            this.resolvePromise();
        } catch (e) {
            const message = `Failed to cleanup channels : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async createChannel(channelName: string, hostUsername: string): Promise<Channel> {
        try {
            const channelId = new Types.ObjectId();
            await this.userModel.updateOne({ username: hostUsername }, { $push: { channels: channelId } });
            return await this.channelModel.create({
                name: channelName,
                members: [hostUsername],
                _id: channelId,
            });
        } catch (e) {
            const message = `Failed to add the channel in the DB : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async deleteChannel(channelId: string) {
        try {
            const channelData = await this.channelModel.findByIdAndDelete(channelId);
            await this.userModel.updateMany({ username: { $in: channelData.members } }, { $pull: { channels: channelId } });
        } catch (e) {
            const message = `Failed to delete channel '${channelId}' : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async addMemberToChannel(username: string, channelId: string) {
        try {
            await this.channelModel.updateOne({ _id: channelId }, { $push: { members: username } });
            await this.userModel.updateOne({ username }, { $push: { channels: channelId } });
        } catch (e) {
            const message = `Placeholder Message : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async removeMemberFromChannel(username: string, channelId: string) {
        try {
            await this.channelModel.updateOne({ _id: channelId }, { $pull: { members: username } });
            await this.userModel.updateOne({ username }, { $pull: { channels: channelId } });
        } catch (e) {
            const message = `Placeholder Message : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async getAllChannels(): Promise<Channel[]> {
        try {
            await this.startPromise;
            return await this.channelModel.find({});
        } catch (e) {
            const message = `Placeholder Message : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async getChannel(channelId: string): Promise<Channel> {
        try {
            await this.startPromise;
            return await this.channelModel.findOne({ _id: channelId });
        } catch (e) {
            const message = `Placeholder Message : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    async updateUsername(oldUsername: string, newUsername: string) {
        try {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            await this.channelModel.updateMany({}, { $set: { 'members.$[filter]': newUsername } }, { arrayFilters: [{ filter: oldUsername }] });
        } catch (e) {
            const message = `Placeholder Message : ${e.message}`;
            return Promise.reject(this.getTranslatedError(e.code, message));
        }
    }

    private getTranslatedError(triggerCode: number | string, message: string, ...args: ErrorTrigger[]): ErrorDTO {
        for (const trigger of args) if (triggerCode === trigger.triggerCode && trigger.condition) return trigger.binding.dto(message);
        if (typeof triggerCode === 'string') return ErrorCodes.get(triggerCode)?.dto(message);
        return Error.Misc.UNKNOWN.dto(message);
    }
}
