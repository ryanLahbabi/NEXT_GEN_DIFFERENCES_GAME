import { FinalLinearSet } from './final-linear-set';
import { Hint } from './hint';

export interface FinalDifference {
    yMin: number;
    yMax: number;
    lines: FinalLinearSet[][];
    hints: Hint[];
}
