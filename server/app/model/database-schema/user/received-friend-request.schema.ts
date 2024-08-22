import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReceivedFriendRequestDocument = ReceivedFriendRequest & Document;

@Schema({ _id: false })
export class ReceivedFriendRequest {
    @Prop({ required: true })
    from: string;

    @Prop({ default: false })
    seen: boolean;
}
export const receivedFriendRequestSchema = SchemaFactory.createForClass(ReceivedFriendRequest);
