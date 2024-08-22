import { PaddingRadius } from '@common/enums/game-creation/padding-radius';
import { IsDefined, IsEnum, IsString } from 'class-validator';

export class CardValidationFilter {
    @IsDefined()
    @IsString()
    originalImage: string;

    @IsDefined()
    @IsString()
    modifiedImage: string;

    @IsDefined()
    @IsEnum(PaddingRadius)
    range: PaddingRadius;
}
