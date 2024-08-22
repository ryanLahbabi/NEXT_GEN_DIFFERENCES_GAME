import { IsDefined, IsNotEmpty, IsNumber, IsPositive, IsString, Length, Max } from 'class-validator';
import { GAMEID_LENGTH, IMAGE_HEIGHT, IMAGE_WIDTH } from './game.constants';

export class GameClickFilter {
    @IsNotEmpty()
    @IsString()
    @Length(GAMEID_LENGTH, GAMEID_LENGTH)
    gameId: string;

    @IsDefined()
    @IsNumber()
    @IsPositive()
    @Max(IMAGE_WIDTH)
    x: number;

    @IsDefined()
    @IsNumber()
    @IsPositive()
    @Max(IMAGE_HEIGHT)
    y: number;
}
