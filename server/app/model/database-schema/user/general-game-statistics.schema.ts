import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { GameStatistics, gameStatisticsSchema } from './game-statistics.schema';

export type GeneralGameStatisticsDocument = GeneralGameStatistics & Document;

@Schema({ _id: false })
export class GeneralGameStatistics {
    @Prop({ type: gameStatisticsSchema, default: new GameStatistics() })
    classicDeathMatch: GameStatistics;

    @Prop({ type: gameStatisticsSchema, default: new GameStatistics() })
    limitedTimeDeathMatch: GameStatistics;

    @Prop({ type: gameStatisticsSchema, default: new GameStatistics() })
    generalGameData: GameStatistics;
}
export const generalGameStatisticsSchema = SchemaFactory.createForClass(GeneralGameStatistics);
