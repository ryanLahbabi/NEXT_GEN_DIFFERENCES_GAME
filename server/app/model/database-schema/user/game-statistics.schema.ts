import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GameStatisticsDocument = GameStatistics & Document;

@Schema({ _id: false })
export class GameStatistics {
    @Prop({ default: 0 })
    gamesPlayed: number;

    @Prop({ default: 0 })
    gamesWinned: number;

    @Prop({ default: 0 })
    averageDifferencesFound: number;

    @Prop({ default: 0 })
    averageTimePlayed: number;
}
export const gameStatisticsSchema = SchemaFactory.createForClass(GameStatistics);
