import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VideoDocument = Video & Document;

@Schema()
export class Video extends Document {
    @Prop({ required: true, type: Date })
    createdAt: Date;

    @Prop({ required: true, type: String })
    createdBy: string;
}

export const videoSchema = SchemaFactory.createForClass(Video);
