import FileSystemManager from '@app/class/diverse/file-system-manager/file-system-manager';
import { Video, VideoDocument } from '@app/model/database-schema/video/video.schema';
import { Replay, ReplayListInfo } from '@common/interfaces/game-play/replay-action';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable({ durable: true })
export class ReplayService {
    constructor(@InjectModel(Video.name) private videoModel: Model<VideoDocument>) {}

    async postReplay(replay: Replay) {
        try {
            const result = await this.videoModel.create({ createdAt: replay.createdAt, createdBy: replay.createdBy });
            FileSystemManager.storeVideo(result['_id'].toString(), replay);
        } catch (error) {
            throw new Error(`Failed to save the replay: ${error.message}`);
        }
    }

    async getReplayInfoByUser(createdBy: string): Promise<ReplayListInfo[]> {
        try {
            const infos = await this.videoModel.find({ createdBy });
            const videos: ReplayListInfo[] = [];
            const validRecords = FileSystemManager.getValidVideoInfo(infos).map((i) => i.id);
            for (const id of validRecords) {
                const video = FileSystemManager.getVideo(id);
                if (video) {
                    videos.push({
                        createdAt: video.createdAt.toString(),
                        gameName: video.gameDetails.gameName,
                        players: video.gameDetails.players,
                        difficulty: video.gameDetails.difficulty,
                        totalDifferences: video.gameDetails.totalDifferences,
                    });
                }
            }
            return videos;
        } catch (error) {
            throw new Error(`Failed to get the replay: ${error.message}`);
        }
    }

    async getReplayDatesByUser(createdBy: string): Promise<string[]> {
        try {
            const replays = await this.videoModel.find({ createdBy }, { createdAt: 1 });
            const date = FileSystemManager.getValidVideoInfo(replays);
            return date.map((i) => i.date);
        } catch (error) {
            throw new Error(`Failed to get the replay: ${error.message}`);
        }
    }

    async getReplayByDatesAndUser(createdBy: string, createdAt: string): Promise<Replay> {
        try {
            const createdAtDate = new Date(createdAt);

            const startOfCreatedAt = new Date(createdAtDate.getTime());
            startOfCreatedAt.setMilliseconds(0);

            const endOfCreatedAt = new Date(startOfCreatedAt.getTime());
            endOfCreatedAt.setSeconds(startOfCreatedAt.getSeconds() + 1);

            const replay = await this.videoModel.findOne({
                createdBy,
                createdAt: {
                    $gte: startOfCreatedAt,
                    $lt: endOfCreatedAt,
                },
            });
            return FileSystemManager.getVideo(replay['_id'].toString());
        } catch (error) {
            throw new Error(`Failed to get the replay: ${error.message}`);
        }
    }

    async deleteReplay(createdBy: string, createdAt: string): Promise<void> {
        try {
            const createdAtSerialised = new Date(createdAt);
            await this.videoModel.deleteOne({ createdBy, createdAt: createdAtSerialised }).exec();
        } catch (error) {
            throw new Error(`Failed to delete the replay: ${error.message}`);
        }
    }

    async updateUsername(oldUsername: string, newUsername: string) {
        try {
            await this.videoModel.updateMany({ createdBy: oldUsername }, { $set: { createdBy: newUsername } });
        } catch (e) {
            throw new Error(`Failed to udpate replay owner username: ${e}`);
        }
    }
}
