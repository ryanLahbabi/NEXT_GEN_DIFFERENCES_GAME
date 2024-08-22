/* eslint-disable @typescript-eslint/no-magic-numbers */
import { FormatTimePipe } from './format-time.pipe';

describe('FormatTimePipe', () => {
    const pipe = new FormatTimePipe();

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return 00:00 when value is 0', () => {
        expect(pipe.transform(0)).toBe('00:00');
    });

    it('should return 60:59 when value is 3659', () => {
        expect(pipe.transform(3659)).toBe('60:59');
    });

    it('should return 01:00 when value is 60', () => {
        expect(pipe.transform(60)).toBe('01:00');
    });

    it('should return 01:01 when value is 61', () => {
        expect(pipe.transform(61)).toBe('01:01');
    });
    it('should return invalid number when value is -3', () => {
        expect(pipe.transform(-3)).toBe('invalid number');
    });
    it('should return invalid number when value is 3.14', () => {
        expect(pipe.transform(3.14)).toBe('invalid number');
    });
});
