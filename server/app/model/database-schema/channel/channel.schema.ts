import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type ChannelDocument = Channel & Document;

@Schema({ _id: true })
export class Channel {
    @Prop({ required: true })
    name: string;

    @Prop({ type: [String], default: [] })
    members: string[];

    @Prop({ type: SchemaTypes.ObjectId })
    _id: Types.ObjectId;
}
export const channelSchema = SchemaFactory.createForClass(Channel);
