import { Channel } from '@app/model/database-schema/channel/channel.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { GeneralGameStatistics, generalGameStatisticsSchema } from './general-game-statistics.schema';
import { InterfacePrefences, InterfacePrefencesDocument, interfacePrefencesSchema } from './interface-preferences.schema';
import { PendingFriendRequests, PendingFriendRequestsDocument, pendingFriendRequestsSchema } from './pending-friend-requests.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    doubleHashedPassword: string;

    @Prop({ required: true })
    avatar: string;

    @Prop({ default: false })
    isFriendRequested: boolean;

    @Prop({ default: '' })
    biography: string;

    @Prop({ default: [] })
    blockRelations: string[];

    @Prop({ default: [] })
    hasBlocked: string[];

    @Prop({ default: [] })
    friends: string[];

    @Prop({ default: './assets/success.mp3' })
    success: string;

    @Prop({ default: './assets/error.wav' })
    failure: string;

    @Prop({ type: pendingFriendRequestsSchema, default: new PendingFriendRequests() })
    pendingFriendRequests: PendingFriendRequestsDocument;

    @Prop({ type: interfacePrefencesSchema, default: new InterfacePrefences() })
    interfacePreference: InterfacePrefencesDocument;

    @Prop({ type: generalGameStatisticsSchema, default: new GeneralGameStatistics() })
    generalGameStatistics: GeneralGameStatistics;

    @Prop({ type: [Types.ObjectId], ref: Channel.name, default: [] })
    channels: Types.ObjectId[];

    @Prop({ default: 100, min: 0 })
    elo: number;

    @Prop({ default: [] })
    likedCards: string[];

    @Prop({ default: [] })
    dislikedCards: string[];
}
export const userSchema = SchemaFactory.createForClass(User);
