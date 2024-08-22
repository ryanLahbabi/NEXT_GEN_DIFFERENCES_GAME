import { Difficulty } from '@common/enums/game-play/difficulty';
import { BestTimes } from '@common/interfaces/game-card/best-times';
import { Card } from '@common/interfaces/game-card/card';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { bestTimesSchema } from './best-times.schema';
import { DifferenceDocument, differenceSchema } from './difference.schema';

@Schema()
export class CardDocument extends Document implements Card {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    difficulty: Difficulty;

    @Prop({ type: bestTimesSchema, required: true })
    classicSoloBestTimes: BestTimes;

    @Prop({ type: bestTimesSchema, required: true })
    classic1v1BestTimes: BestTimes;

    @Prop({ required: true })
    differenceNbr: number;

    @Prop({ type: [differenceSchema], required: true })
    differences: DifferenceDocument[];

    @Prop({ required: false, default: 0 })
    likes: number;
}

export const cardSchema = SchemaFactory.createForClass(CardDocument);
