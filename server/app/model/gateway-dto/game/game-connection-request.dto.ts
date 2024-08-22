import { GameMode } from '@common/enums/game-play/game-mode';
import { IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { CARDID_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from './game.constants';

export class GameConnectionRequestFilter {
    @IsNotEmpty()
    @IsEnum(GameMode)
    gameMode: GameMode;

    @IsNotEmpty()
    @IsString()
    @Length(NAME_MIN_LENGTH, NAME_MAX_LENGTH)
    playerName: string;

    @IsOptional()
    @IsString()
    @Length(CARDID_LENGTH, CARDID_LENGTH)
    cardId: string;

    @IsOptional()
    @IsString()
    gameId: string;

    @IsOptional()
    playersWithAccess: string[];
}
