import { BestTime } from '@common/interfaces/game-card/best-time';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TimeConceptDocument, timeConceptSchema } from './time.schema';

@Schema({ _id: false })
export class BestTimeDocument extends Document implements BestTime {
    @Prop({ require: true })
    name: string;

    @Prop({ type: timeConceptSchema, required: true })
    time: TimeConceptDocument;
}

export const bestTimeSchema = SchemaFactory.createForClass(BestTimeDocument);
