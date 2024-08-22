import { HEIGHT, WIDTH } from '@app/class/algorithms/difference-locator/difference-locator.constants';
import { Hint } from '@common/interfaces/difference-locator-algorithm/hint';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CoordinatesDocument, coordinatesSchema } from './coordinate-schema';

@Schema({ _id: false })
export class HintDocument extends Document implements Hint {
    @Prop({ type: coordinatesSchema, required: true, default: { x: 0, y: 0 } })
    start: CoordinatesDocument;

    @Prop({ type: coordinatesSchema, required: true, default: { x: WIDTH, y: HEIGHT } })
    end: CoordinatesDocument;
}

export const hintSchema = SchemaFactory.createForClass(HintDocument);
