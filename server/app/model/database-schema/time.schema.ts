import { TimeConcept } from '@common/interfaces/general/time-concept';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class TimeConceptDocument extends Document implements TimeConcept {
    @Prop({ required: true })
    seconds: number;

    @Prop({ required: true })
    minutes: number;
}
export const timeConceptSchema = SchemaFactory.createForClass(TimeConceptDocument);
