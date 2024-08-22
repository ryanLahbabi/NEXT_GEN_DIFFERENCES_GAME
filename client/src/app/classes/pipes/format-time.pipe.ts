import { Pipe, PipeTransform } from '@angular/core';
import { NB_SECONDS_IN_MINUTE, SLICE_INDEX } from '@app/constants/time-constants';

@Pipe({
    name: 'formatTime',
})
export class FormatTimePipe implements PipeTransform {
    transform(value: number): string {
        if (value < 0 || value % 1 !== 0) {
            return 'invalid number';
        }
        const minutes: number = Math.floor(value / NB_SECONDS_IN_MINUTE);
        return ('00' + minutes).slice(SLICE_INDEX) + ':' + ('00' + Math.floor(value - minutes * NB_SECONDS_IN_MINUTE)).slice(SLICE_INDEX);
    }
}
