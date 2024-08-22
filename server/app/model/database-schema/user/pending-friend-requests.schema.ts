import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ReceivedFriendRequestDocument, receivedFriendRequestSchema } from './received-friend-request.schema';

export type PendingFriendRequestsDocument = PendingFriendRequests & Document;

@Schema({ _id: false })
export class PendingFriendRequests {
    @Prop({ default: [] })
    sent: string[];

    @Prop({ type: [receivedFriendRequestSchema], default: [] })
    received: ReceivedFriendRequestDocument[];
}
export const pendingFriendRequestsSchema = SchemaFactory.createForClass(PendingFriendRequests);
