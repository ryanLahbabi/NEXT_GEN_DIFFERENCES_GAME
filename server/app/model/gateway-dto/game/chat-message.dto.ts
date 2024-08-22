import { IsDefined, IsNumber, IsString, Length } from 'class-validator';
import { GAMEID_LENGTH, MAX_CHAT_MESSAGE_LENGTH, MIN_CHAT_MESSAGE_LENGTH } from './game.constants';

export class ChatMessageFilter {
    @IsDefined()
    @IsString()
    @Length(MIN_CHAT_MESSAGE_LENGTH, MAX_CHAT_MESSAGE_LENGTH)
    message: string;

    @IsDefined()
    @IsString()
    @Length(GAMEID_LENGTH, GAMEID_LENGTH)
    gameId: string;

    @IsDefined()
    @IsNumber()
    timestamp: number;

    @IsDefined()
    isAGif: boolean;
}
