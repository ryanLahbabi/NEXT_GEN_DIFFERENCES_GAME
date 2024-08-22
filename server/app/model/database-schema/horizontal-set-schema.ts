import { FinalLinearSet } from '@common/interfaces/difference-locator-algorithm/final-linear-set';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class HorizontalSetDocument extends Document implements FinalLinearSet {
    @Prop({ required: true })
    start: number;

    @Prop({ required: true })
    end: number;
}

export const horizontalSetSchema = SchemaFactory.createForClass(HorizontalSetDocument);
