import * as ErrorJson from '@common/http-error-types/errors.json';
import * as assert from 'assert';
import ErrorBinding from './error-binding';

export default class ErrorCodes {
    private static readonly messageSeparator: string = 'Θ';
    private static bindings: { [code: string]: ErrorBinding } = {};

    static load() {
        const codeIndexLen = 3;
        const existingPrefixes: string[] = [];
        const existingNames: string[] = [];
        const ten = 10;
        for (const errorType of ErrorJson) {
            assert(!existingPrefixes.includes(errorType.prefix), `Duplicate prefixes '${errorType.prefix}' in error json.`);
            existingPrefixes.push(errorType.prefix);
            let codeIndex = 0;
            for (const error of errorType.errors) {
                assert(!existingNames.includes(error.name), `Duplicate names '${error.name}' in error json.`);
                existingNames.push(error.name);
                for (let i = 1; i <= codeIndexLen; i++)
                    if (codeIndex < ten ** i) {
                        const code = `${errorType.prefix}${'0'.repeat(codeIndexLen - i)}${codeIndex++}`;
                        const binding = new ErrorBinding(code, error.name, error.message, this.messageSeparator);
                        this.bindings[code] = binding;
                        break;
                    }
            }
        }
    }

    static getByName(name: string): ErrorBinding {
        for (const error of Object.values(this.bindings))
            if (error.name === name) {
                return error;
            }
    }

    static get(code: string): ErrorBinding {
        return this.bindings[code];
    }
}
