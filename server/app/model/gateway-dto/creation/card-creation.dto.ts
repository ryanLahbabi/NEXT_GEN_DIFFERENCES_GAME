import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@app/model/gateway-dto/game/game.constants';
import { PaddingRadius } from '@common/enums/game-creation/padding-radius';
import { IsDefined, IsEnum, IsString, Length } from 'class-validator';

export class CardCreationFilter {
    @IsDefined()
    @IsString()
    originalImage: string;

    @IsDefined()
    @IsString()
    modifiedImage: string;

    @IsDefined()
    @IsEnum(PaddingRadius)
    range: PaddingRadius;

    @IsDefined()
    @IsString()
    @Length(NAME_MIN_LENGTH, NAME_MAX_LENGTH)
    name: string;
}
