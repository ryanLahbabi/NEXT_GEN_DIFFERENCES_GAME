import { Difficulty } from '../../enums/game-play/difficulty';

export interface CardValidationOutputDto {
    valid: boolean;
    differenceNbr: number;
    difficulty: Difficulty;
    differenceImage?: string;
}
