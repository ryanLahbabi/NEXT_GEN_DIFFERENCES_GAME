import { GameMode } from '@common/enums/game-play/game-mode';
import { PlayerRecord } from '@common/interfaces/records/player-record';
import { Record } from '@common/interfaces/records/record';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { playerRecordSchema } from './player-record.schema';
import { TimeConceptDocument, timeConceptSchema } from './time.schema';

@Schema()
export class RecordDocument extends Document implements Record {
    @Prop({ required: true })
    startDate: string;

    @Prop({ type: timeConceptSchema, required: true })
    duration: TimeConceptDocument;

    @Prop({ required: true })
    gameMode: GameMode;

    @Prop({ type: [playerRecordSchema], required: true })
    players: PlayerRecord[];
}

export const recordSchema = SchemaFactory.createForClass(RecordDocument);
