import { Coordinates } from '@common/interfaces/general/coordinates';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class CoordinatesDocument extends Document implements Coordinates {
    @Prop({ required: true, default: 0 })
    x: number;

    @Prop({ required: true, default: 0 })
    y: number;
}

export const coordinatesSchema = SchemaFactory.createForClass(CoordinatesDocument);
