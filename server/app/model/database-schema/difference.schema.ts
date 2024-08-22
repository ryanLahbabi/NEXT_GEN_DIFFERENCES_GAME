import { FinalDifference } from '@common/interfaces/difference-locator-algorithm/final-difference';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MAX_DIFFERENCE_Y, MIN_DIFFERENCE_Y } from './database.constants';
import { HintDocument, hintSchema } from './hint.schema';
import { HorizontalSetDocument, horizontalSetSchema } from './horizontal-set-schema';

@Schema({ _id: false })
export class DifferenceDocument extends Document implements FinalDifference {
    @Prop({ required: true, default: MIN_DIFFERENCE_Y })
    yMin: number;

    @Prop({ required: true, default: MAX_DIFFERENCE_Y })
    yMax: number;

    @Prop({ type: [[horizontalSetSchema]], required: true })
    lines: HorizontalSetDocument[][];

    @Prop({ type: [hintSchema], required: true })
    hints: HintDocument[];
}

export const differenceSchema = SchemaFactory.createForClass(DifferenceDocument);
