import { BestTime } from '@common/interfaces/game-card/best-time';
import { BestTimes } from '@common/interfaces/game-card/best-times';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { bestTimeSchema } from './best-time.schema';

@Schema({ _id: false })
export class BestTimesDocument extends Document implements BestTimes {
    @Prop({ type: bestTimeSchema, require: true })
    firstPlace: BestTime;

    @Prop({ type: bestTimeSchema, require: true })
    secondPlace: BestTime;

    @Prop({ type: bestTimeSchema, require: true })
    thirdPlace: BestTime;
}

export const bestTimesSchema = SchemaFactory.createForClass(BestTimesDocument);
