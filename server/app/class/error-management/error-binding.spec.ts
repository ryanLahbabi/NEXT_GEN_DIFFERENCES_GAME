import ErrorDTO from '@common/dto/error.dto';
import ErrorBinding from './error-binding';
import ErrorCodes from './error-codes';
import InternalError from './internal-error';

describe('error-binding', () => {
    let ERROR: ErrorBinding;
    let ERROR_DATA: ErrorDTO;
    beforeAll(() => {
        ErrorCodes.load();
        ERROR = ErrorCodes.getByName('UNKNOWN');
        ERROR_DATA = {
            code: 'Misc000',
            name: 'UNKNOWN',
        };
    });

    describe('dto', () => {
        it('should return a valid object', () => {
            const receivedObject: ErrorDTO = ERROR.dto('message');
            const validObject: ErrorDTO = { ...ERROR_DATA, message: 'message' };
            expect(receivedObject).toMatchObject(validObject);
        });
    });

    describe('generateErrorIf', () => {
        it('should throw an error & override message', () => {
            const validObject: ErrorDTO = { ...ERROR_DATA, message: 'message' };
            expect(() => ERROR.generateErrorIf(true).overrideMessage('message')).toThrowError(new InternalError(validObject));
        });
    });
});
