import { PlayerRecord } from '@common/interfaces/records/player-record';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class PlayerRecordDocument extends Document implements PlayerRecord {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    winner: boolean;

    @Prop({ required: true })
    deserter: boolean;
}

export const playerRecordSchema = SchemaFactory.createForClass(PlayerRecordDocument);
