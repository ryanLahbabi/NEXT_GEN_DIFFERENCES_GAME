import Difference from '../../../server/app/class/algorithms/difference-locator/difference';
import { LinearSet } from './linear-set';

export interface LinearPaddingSet extends LinearSet {
    keep: boolean;
    difference: Difference;
}
